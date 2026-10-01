# Certificate Auth Service

> 소셜 로그인, X.509 인증서 발급, 전자서명 로그인, 전자봉투 전송 기능을 제공하는 공개키 기반(PKI) 보안 웹 서비스입니다.

🔗 **배포 주소**: https://crypto-web-hvon.vercel.app/

---

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [주요 기능](#주요-기능)
3. [암호 프로토콜 흐름](#암호-프로토콜-흐름)
4. [기술 스택](#기술-스택)
5. [프로젝트 구조](#프로젝트-구조)
6. [API 명세](#api-명세)
7. [데이터베이스 스키마](#데이터베이스-스키마)
8. [실행 방법](#실행-방법)
9. [한계 및 개선 방향](#한계-및-개선-방향)

---

## 프로젝트 개요

보안 프로토콜에서 다루는 공개키 기반 구조(PKI)의 핵심 요소를 웹 서비스로 구현한 프로젝트입니다.
자체 루트 CA를 두고, 사용자가 브라우저에서 직접 생성한 키쌍으로 인증서를 발급받아 전자서명 로그인과 전자봉투 송수신에 사용합니다.

| 개념 | 구현 |
| --- | --- |
| 인증 기관(CA) | 자체 서명 루트 CA (RSA 2048, SHA-256, 유효기간 10년) |
| 사용자 인증서 | X.509 v3, 유효기간 365일, `clientAuth` · `emailProtection` 용도 |
| 키 생성 | 브라우저 Web Crypto API (개인키는 서버로 전송되지 않음) |
| 전자서명 | RSASSA-PKCS1-v1_5 + SHA-256 |
| 전자봉투 | AES-256-CBC(본문) + RSA-OAEP/SHA-256(세션키) 하이브리드 암호 |
| 재전송 방지 | 1회용 챌린지 (32바이트 난수, 5분 만료) |

---

## 주요 기능

### 1. 소셜 로그인
NextAuth(Auth.js v5)와 Google OAuth로 로그인합니다. 최초 로그인 시 사용자 정보가 PostgreSQL에 등록됩니다.

### 2. 인증서 발급
브라우저에서 RSA 2048 키쌍을 생성하고, 공개키만 서버에 보내 CA 서명 인증서를 발급받습니다.
개인키와 발급된 인증서는 브라우저 저장소에 보관됩니다.

### 3. 인증서 관리 · 폐지
보유한 인증서의 상태(ACTIVE / REVOKED), 시리얼 번호, 발급일과 만료일을 확인하고 폐지할 수 있습니다.
폐지된 인증서는 전자서명 로그인과 전자봉투 송수신에 사용할 수 없습니다.

### 4. 전자서명 로그인
서버가 발급한 1회용 챌린지에 개인키로 서명하고, 서버가 인증서의 공개키로 검증합니다.
챌린지는 한 번 사용되거나 5분이 지나면 무효화됩니다.

### 5. 전자봉투 송수신
발신자가 메시지에 서명해 보내면, 서버가 서명을 검증한 뒤 수신자 공개키로 봉투를 만들어 저장합니다.
수신자는 받은 메시지함에서 자신의 개인키로 브라우저에서 직접 복호화합니다. 자기 자신에게 보내는 것도 가능합니다.

---

## 암호 프로토콜 흐름

### 인증서 발급

```mermaid
sequenceDiagram
    participant B as 브라우저
    participant S as 서버
    participant CA as 루트 CA 키
    participant DB as PostgreSQL

    B->>B: Web Crypto로 RSA 2048 키쌍 생성
    B->>S: 공개키(PEM) 전송
    S->>CA: 사용자 정보 + 공개키로 X.509 인증서 생성
    CA-->>S: CA 개인키로 서명 (SHA-256)
    S->>DB: 인증서 저장 (status = ACTIVE)
    S-->>B: 인증서(PEM) 반환
    B->>B: 개인키 · 인증서 브라우저에 저장
```

### 전자서명 로그인

```mermaid
sequenceDiagram
    participant B as 브라우저
    participant S as 서버
    participant DB as PostgreSQL

    B->>S: 챌린지 요청
    S->>DB: 활성 인증서 확인, 32바이트 난수 챌린지 저장 (5분 만료)
    S-->>B: challengeId, challenge
    B->>B: 개인키로 챌린지 서명 (RSASSA-PKCS1-v1_5)
    B->>S: challengeId, 서명값
    S->>DB: 미사용 · 미만료 챌린지 조회
    S->>S: 인증서 공개키로 서명 검증
    S->>DB: 챌린지 사용 처리 (재사용 불가)
    S-->>B: 검증 결과
```

### 전자봉투 송수신

```mermaid
sequenceDiagram
    participant A as 발신자 브라우저
    participant S as 서버
    participant DB as PostgreSQL
    participant R as 수신자 브라우저

    A->>A: 평문에 개인키로 서명
    A->>S: 수신자 이메일, 평문, 서명값
    S->>S: 발신자 공개키로 서명 검증
    S->>S: AES-256 세션키 생성 → 평문 암호화 (CBC)
    S->>S: 세션키를 수신자 공개키로 암호화 (RSA-OAEP)
    S->>DB: 암호문, 암호화된 세션키, 서명 저장
    R->>S: 봉투 요청
    S-->>R: 암호문, 암호화된 세션키
    R->>R: 개인키로 세션키 복호화 → 본문 복호화
```

---

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Radix UI, lucide-react |
| 인증 | NextAuth (Auth.js v5), Google OAuth, JWT 세션 |
| 암호 | node-forge (서버: 인증서 발급 · 서명 검증 · 봉투 생성), Web Crypto API (클라이언트: 키 생성 · 서명 · 복호화) |
| 데이터베이스 | PostgreSQL, Prisma ORM |
| 검증 | Zod |
| 배포 | Vercel |

---

## 프로젝트 구조

```
Crypto-Web/
├─ app/
│  ├─ page.tsx                     # 랜딩 페이지
│  ├─ (auth)/login/                # 소셜 로그인
│  ├─ dashboard/
│  │  ├─ page.tsx                  # 대시보드 (상태 요약, 빠른 이동)
│  │  ├─ cert/issue/               # 키쌍 생성 · 인증서 발급
│  │  ├─ cert/manage/              # 인증서 조회 · 폐지
│  │  ├─ cert/login/               # 전자서명 로그인
│  │  ├─ envelope/                 # 전자봉투 작성 · 전송
│  │  ├─ envelope/inbox/           # 받은 메시지함 · 복호화
│  │  └─ profile/
│  └─ api/                         # API 라우트 (아래 명세 참고)
│
├─ components/
│  ├─ cert/                        # 키 생성, 인증서 발급, 서명 로그인 카드
│  ├─ envelope/                    # 봉투 작성기, 메시지함, 복호화 결과
│  ├─ dashboard/, layout/, auth/
│  └─ ui/                          # shadcn/ui 컴포넌트
│
├─ lib/
│  ├─ forge/                       # 서버 측 암호 (인증서 발급, 서명 검증, 봉투 생성, 체인 검증)
│  ├─ client/                      # 클라이언트 측 암호 (키 생성, 서명, 봉투 복호화)
│  ├─ storage/                     # 브라우저 저장소 (개인키, 인증서)
│  └─ db.ts                        # Prisma 클라이언트
│
├─ prisma/schema.prisma            # DB 스키마
├─ scripts/init-ca.mjs             # 루트 CA 키쌍 · 인증서 생성 스크립트
└─ auth.ts                         # NextAuth 설정
```

---

## API 명세

모든 API는 로그인 세션이 필요합니다.

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `POST` | `/api/cert/issue` | 공개키를 받아 CA 서명 인증서 발급 |
| `POST` | `/api/cert/revoke` | 본인 인증서 폐지 |
| `POST` | `/api/cert/verify` | CA 체인 검증을 포함한 서명 검증 |
| `POST` | `/api/sign-login/challenge` | 전자서명 로그인용 1회용 챌린지 발급 |
| `POST` | `/api/sign-login/verify` | 챌린지 서명 검증 |
| `POST` | `/api/envelope/send` | 발신자 서명 검증 후 전자봉투 생성 · 저장 |
| `GET` | `/api/envelope/inbox` | 받은 메시지 목록 조회 |
| `POST` | `/api/envelope/decrypt` | 복호화용 봉투 데이터 조회 (읽음 처리) |
| `GET` | `/api/user/me` | 사용자 정보 및 인증서 목록 조회 |

---

## 데이터베이스 스키마

```mermaid
erDiagram
    User ||--o{ Certificate : owns
    User ||--o{ LoginChallenge : requests
    User ||--o{ Envelope : sends
    User ||--o{ Envelope : receives

    User {
        string id PK
        string email UK
        string name
    }
    Certificate {
        string id PK
        string serialNumber UK
        string publicKeyPem
        string certificatePem
        string status "ACTIVE / REVOKED"
        datetime expiresAt
        datetime revokedAt
    }
    LoginChallenge {
        string id PK
        string challenge UK
        boolean used
        datetime expiresAt
    }
    Envelope {
        string id PK
        string ciphertext "AES-CBC (iv + data)"
        string encryptedKey "RSA-OAEP"
        string signature
        string status "UNREAD / READ"
    }
```

---

## 실행 방법

### 1. 설치

```bash
git clone https://github.com/rudrb/Crypto-Web.git
cd Crypto-Web
npm install
```

### 2. 루트 CA 생성

```bash
node scripts/init-ca.mjs
```

`ca-cert.pem`, `ca-private-key.pem` 파일이 생성되고, `.env.local`에 붙여 넣을 수 있도록 줄바꿈이 이스케이프된 값이 출력됩니다.
PEM 파일은 `.gitignore`에 포함되어 있으므로 저장소에 올라가지 않습니다.

> ⚠️ 스크립트는 개인키를 `CA_PRIVATE_KEY_PEM` 이름으로 출력하지만, 서버 코드는 `CA_KEY_PEM`을 읽습니다. 환경 변수에는 **`CA_KEY_PEM`** 으로 등록하세요.

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다.

```env
# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB"

# NextAuth
AUTH_SECRET="랜덤 문자열 (npx auth secret 으로 생성)"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# 루트 CA (init-ca.mjs 출력값)
CA_CERT_PEM="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----\n"
CA_KEY_PEM="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
```

Google OAuth 클라이언트의 승인된 리디렉션 URI에는 `http://localhost:3000/api/auth/callback/google`을 등록합니다.

### 4. DB 스키마 반영 및 실행

```bash
npx prisma generate
npx prisma db push
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### 5. 사용 순서

1. Google 계정으로 로그인
2. **인증서 발급** 페이지에서 키쌍 생성 후 인증서 발급
3. **전자서명 로그인** 페이지에서 챌린지 서명 · 검증
4. **전자봉투** 페이지에서 수신자 이메일(본인 포함)을 입력해 메시지 전송
5. **받은 메시지함**에서 복호화

---

## 한계 및 개선 방향

학습용 프로젝트로서 프로토콜 흐름 구현에 초점을 맞췄으며, 실제 서비스 수준의 보안을 위해서는 아래 항목의 개선이 필요합니다.

- **전자봉투 암호화 위치**: 현재는 평문이 서버로 전달된 뒤 서버에서 암호화됩니다. 종단 간 암호화(E2EE)를 위해서는 발신자 브라우저에서 수신자 인증서로 직접 봉투를 생성하도록 바꿔야 합니다.
- **개인키 보관 방식**: 개인키를 브라우저 `localStorage`에 평문 PEM으로 저장하고 있어 XSS에 취약합니다. Web Crypto의 추출 불가능(non-extractable) 키를 IndexedDB에 저장하거나, 비밀번호 기반으로 암호화(PKCS#8 + PBKDF2)하는 방식으로 개선할 수 있습니다.
- **인증서 검증 범위**: 전자서명 로그인과 전자봉투 전송 시 DB의 인증서 상태(ACTIVE)와 공개키만 확인합니다. CA 서명 체인과 유효기간까지 검증하는 로직(`lib/forge/ca.ts`)이 있으나 해당 흐름에는 아직 연결되지 않았습니다.
- **키 용도 분리**: 하나의 RSA 키쌍을 서명과 암호화에 함께 사용합니다. 서명용 · 암호화용 키쌍을 분리하는 것이 권장됩니다.
- **수신 측 서명 검증**: 봉투에 발신자 서명이 저장되지만, 수신자가 복호화 후 서명을 다시 검증하는 단계는 없습니다. 또한 AES-CBC에는 무결성 검증이 없으므로 AES-GCM 전환을 고려할 수 있습니다.
- **폐지 정보 공개**: 폐지 상태는 DB에만 기록됩니다. CRL 또는 OCSP 형태로 제공하면 외부에서도 인증서 유효성을 확인할 수 있습니다.

---

## 팀

| 이름 | GitHub | 담당 |

| 최경규 | [rudrb](https://github.com/rudrb) | 기획 및 코드 작성|
