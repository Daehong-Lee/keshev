# 21단계 학생 실행 안내서 및 시스템 구성도

## 목적과 지원 범위

케셰브는 로컬 웹 화면에서 보호 현황, 업무 앱, 보안 기록을 살펴보는 보안 Agent 실습용 시작 프로젝트입니다. 학생은 지정된 `student/extension.mjs` 표시 함수를 구현합니다. 서버가 시작되거나 예제 화면이 표시되는 것은 기존 접근 제어/XDR 또는 AI 서비스와 연결됐다는 뜻이 아닙니다.

| 항목 | 저장소에서 확인한 기준 | 실행 확인 |
|---|---|---|
| Node.js | `package.json`의 `engines.node`: `24.19.0` | 설치 버전 미확인 |
| PowerShell 실행 도구 | `tools/start-alekov.ps1`은 Node.js 22~24를 허용하고 24.19.0을 기준으로 안내 | 실제 실행 미확인 |
| 운영체제·셸 | 아래 절차는 Windows PowerShell용 | 다른 운영체제·셸 미확인 |
| 브라우저 | 로컬 URL을 직접 엶 | 브라우저 호환성 미확인 |
| npm 의존성 | `package.json`에 dependencies/devDependencies 없음 | 설정 판독. `package-lock.json`은 현재 프로젝트 파일 목록에서 찾지 못함 |

## 폴더와 코드 경계

명령의 작업 폴더는 저장소 안 실제 `on-client/` 디렉터리입니다. 이 폴더에 `package.json`, `src/server.mjs`, `tools/start-alekov.ps1`이 있습니다.

```text
on-client/
├── package.json                    start, demo, check 및 Node 버전
├── tools/start-alekov.ps1          Windows PowerShell 실행 도구
├── src/server.mjs                  로컬 HTTP/API 서버와 제공 기능 조립
├── src/engine.mjs                  기본 disconnected 및 demo 엔진
├── src/ai/                         AI 서비스·연결·권한 검증 모듈
├── src/connection/                 호스트 계정 연결 모듈
├── src/vulnerabilities/            lockfile/설치 메타데이터·OSV 조회
├── public/                         제공 HTML·브라우저 코드·스타일
├── student/extension.mjs           학생 작성 UI 표시 함수
├── student/engine-adapter.mjs      호스트 기능을 받는 학생 어댑터 경계
└── docs/                            문서
```

| 영역 | 파일/함수 | 책임과 경계 |
|---|---|---|
| 학생 작성 화면 | `student/extension.mjs`: `renderIdentity`, `renderStatus`, `renderAiConnection`, `renderVulnerabilities`, `renderDecision`, `renderEvents`, `renderExplanation`, `renderAction` | 학생 UI 표시. 각 과제에서 지정한 함수만 수정 |
| 학생 어댑터 | `student/engine-adapter.mjs`: `createEngine` | 서버가 제공한 호스트 기능과 엔진 인터페이스 사이의 경계. 파일 존재만으로 연결된 것은 아님 |
| 제공 브라우저/UI | `public/index.html`, `public/app.js`, `public/vulnerabilities-view.mjs`, `public/ai-connect.mjs` | 화면, 브라우저 상호작용과 API 요청 |
| 제공 서버 | `src/server.mjs`: `createOnServer` 및 실행 진입점 | 로컬 HTTP/API, 검증과 서버 기능 조립 |
| 엔진 | `src/engine.mjs`: `loadEngine`, `demoEngine` | 엔진 모드 선택. 기본 엔진은 `disconnected`, `--demo`는 예제 |
| 취약점 조회 | `src/vulnerabilities/project-scan.mjs`: `createProjectScanner`; `src/vulnerabilities/osv.mjs`: `buildPackageQueries`, `createOsvClient` | 설정된 프로젝트의 설치 버전과 승인된 공개 패키지를 OSV에 조회 |
| AI 서비스 | `src/ai/service.mjs`: `createOnAiService`; `src/ai/connection.mjs`: `createAlekovAppConnector`; `src/ai/vault-service.mjs`: `createVaultOnAiService` | 앱 연결·권한 검증·AI 기능. 실제 사용은 담당자가 준비한 연결과 권한에 따름 |

## 실행 절차 (PowerShell)

기존 작업 파일과 Git 변경은 지우거나 초기화하지 않습니다.

1. 파일 탐색기에서 실제 `on-client/` 폴더를 열고 주소 표시줄에 `powershell`을 입력해 그 위치에서 새 PowerShell 창을 엽니다.
2. 작업 위치와 Node.js 설치 버전을 확인합니다.

```powershell
Get-Location
Test-Path .\package.json
Test-Path .\src\server.mjs
node --version
```

두 `Test-Path` 결과는 `True`여야 합니다. Node.js 기준은 `v24.19.0`입니다. 실제 설치 버전은 학생이 확인합니다.

3. 선택적으로 학생 확장 문법 검사를 실행합니다.

```powershell
npm run check
```

이는 `node --check student/extension.mjs`만 실행하며 서버·브라우저·외부 서비스를 검사하지 않습니다.

4. 기본 실행 도구로 서버를 시작합니다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1
```

도구를 사용하지 않는 경우 `npm start`도 가능합니다. `package.json`은 `node src/server.mjs`를 실행합니다. 기본 포트는 `5189`, 서버 바인딩 주소는 `127.0.0.1`입니다. 실행 도구는 앱 폴더·Node.js·포트를 검사하고 시작을 기다립니다. 실행 도구와 서버 코드에 정의된 정상 시작 신호는 다음 형식입니다.

```text
케셰브가 켜졌습니다. 브라우저에서 http://127.0.0.1:5189/ 을 여세요.
서버가 응답한 것만 확인했습니다. AI 연결 상태는 화면에서 따로 확인해 주세요.
```

`npm start`를 직접 사용하면 서버 출력 형식은 `케셰브 연결 확인: http://127.0.0.1:5189`입니다. 두 출력 모두 코드에서 확인한 기대 문구이며 이번 작업 중 실행해서 관찰한 것은 아닙니다.

5. 브라우저에서 실제 실행 포트에 맞는 주소를 엽니다.

```text
http://127.0.0.1:5189/
```

6. 종료하려면 실행 중인 PowerShell 창에서 `Ctrl+C`를 누릅니다. 재실행은 같은 `on-client/` 폴더에서 동일한 시작 명령을 다시 실행합니다.

### 포트 충돌 및 예제

다른 프로그램을 종료하지 말고 PowerShell 도구의 대체 포트 옵션을 사용합니다. 실행 옵션은 기존 `docs/STUDENT_LAUNCH_GUIDE.md`의 지시를 따르고, 브라우저 주소도 그 포트로 바꿉니다. 실행 도구의 다른 포트 예시는 다음과 같습니다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1 -Port 5190
```

예제 화면은 다음처럼 실행할 수 있습니다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1 -Demo
```

또는 `npm run demo`를 사용합니다. 예제 데이터는 실제 연결·사건·접근 판정이 아닙니다.

## 글로 쓴 구성도와 데이터 흐름

```text
사용자
  └─ 브라우저 (public/index.html, public/app.js)
       ├─ 학생 화면 표시 (student/extension.mjs)
       └─ 같은 출처의 HTTP/API 요청
            ▼
      로컬 앱 서버 (src/server.mjs; 기본 127.0.0.1:5189)
       ├─ 기본 실행: disconnected 엔진 (src/engine.mjs)
       ├─ 담당자가 SDP 호스트 설정을 제공한 경우:
       │    student/engine-adapter.mjs → 제공 호스트 → 접근 제어/XDR 시스템
       ├─ 앱 연결·권한이 준비된 경우:
       │    src/ai/ → 설정된 AI 게이트웨이
       └─ 사용자가 설치 패키지 조회를 요청한 경우:
            프로젝트 lockfile 및 설치 메타데이터 대조
              → 승인된 공개 패키지만 OSV
                https://api.osv.dev/v1/querybatch
```

로컬 앱 기본 주소는 `http://127.0.0.1:5189/`입니다. OSV 기본 주소는 코드의 `https://api.osv.dev/v1/querybatch`입니다. AI 게이트웨이와 접근 제어/XDR 시스템은 실제 담당자 설정·권한에 따라 달라집니다. 코드에 주소가 있거나 로컬 서버가 시작됐다는 사실은 외부 연결 성공을 뜻하지 않습니다. 프로젝트/승인 패키지가 설정되지 않은 OSV 조회는 미조회 상태일 수 있으며, 비공개 패키지를 외부 조회 대상으로 임의 추가하면 안 됩니다.

## 오류 확인과 복구

| 증상·상태 | 확인 방법 | 복구/주의 |
|---|---|---|
| Node.js 버전 또는 실행 오류 | 새 창에서 `node --version`; `Get-Location` 및 `Test-Path`로 앱 폴더 확인 | 실제 앱 폴더에서 다시 실행하고 기준 버전을 담당 안내와 대조 |
| 포트 사용 중 또는 시작 시간 초과 | 실행 도구가 표시한 포트·오류를 기록 | 다른 프로그램을 종료하지 말고 `-Port`로 다른 포트를 시도. 반복되면 오류 문구를 담당자에게 전달 |
| 브라우저에서 열리지 않음 | 서버 창이 살아 있는지, 주소 포트가 실행 포트와 같은지 확인 | 같은 작업 폴더에서 서버 재시작. 화면 열림과 외부 연결을 구분 |
| `ENGINE_NOT_CONNECTED` / `disconnected` | 기본 실행인지 담당자가 호스트 연결 설정을 제공했는지 확인 | 미연결은 실제 접근 제어/XDR 연결이 아님. 설정을 임의로 만들거나 수정하지 말고 담당자에게 문의 |
| AI 연결 실패·권한 확인 불가 | 화면 오류 코드와 `docs/CONNECTION_TROUBLESHOOT.md`를 확인 | 앱 전용 계정·권한·담당자 설정 확인. 비밀값을 요청·복사·문서화하지 않음 |
| 취약점 조회 `not_configured`, `not_checked`, `partial`, `unverifiable` | `src/vulnerabilities/README.md`에서 상태 의미와 조회 범위 확인 | 미조회·일부 실패는 취약점 없음이 아님. 대상 경로·승인 목록을 임의 변경하지 않음 |

## 확인 기록 및 미확인 항목

**코드 판독으로 확인:** 경로, `package.json` 명령과 Node.js 기준, 기본 포트·바인딩, 출력 문구, 모듈 경계, OSV 기본 URL을 코드에서 확인했습니다.

**실행 또는 실제 화면으로 확인하지 않음:** 이 환경에서 PowerShell·Node.js·npm을 실행하거나 브라우저를 열 수 없습니다. 설치된 버전, `npm run check`, 서버 기동·종료·재실행, 화면 표시, 포트 충돌·오류 복구, XDR·AI·OSV 실제 통신은 모두 미확인입니다. 모의 요청이나 테스트는 수행하지 않았습니다.

학생은 기존 작업을 보존한 채 새 PowerShell에서 위 순서대로 실행합니다. 명령을 실제 실행하지 못한 결과는 미확인으로 기록하고 성공으로 간주하지 않습니다.

## 21·22단계 제출 안내

학생 문서와 이번 단계 코드 변경은 같은 커밋에 저장합니다. 이번 단계에서 문서 외 코드는 임의 수정하지 않습니다. 기존에 준비 중인 변경은 먼저 확인하고 보존합니다. 이 작업에서는 커밋을 만들지 않았습니다.

21·22단계는 과제 화면에 저장소 주소와 제출할 40자리 커밋을 직접 입력합니다. 비공개 저장소를 공개로 전환하지 않습니다. 과제 화면의 **「비공개 저장소 원문 준비 방법」**을 펼쳐 **「원문 전달 도구 받기」**를 사용하고, ZIP과 JSON 출력 폴더는 프로젝트 밖에 둡니다. 프로젝트 Git 최상위 폴더의 PowerShell에서 과제 화면이 제공하는 `student-source-cli.mjs` 명령을 사용합니다. 도구/출력 경로와 `--commit` 값은 실제 PC 경로와 제출할 커밋에 맞춰 확인해야 하므로 여기서 임의 명령이나 값을 만들지 않습니다.

JSON은 같은 단계의 **「비공개 저장소 원문 묶음」**에서 선택합니다. 저장소·커밋·단계를 확인하고 제출합니다. 원문 전달 완료는 AI 검토 통과를 뜻하지 않습니다. 원문 전달만 실패한 경우 기존 접수를 유지하고 **「원문만 다시 보내기」**를 사용합니다. 실제 제출·업로드·유료 요청은 수행하지 않았습니다.
