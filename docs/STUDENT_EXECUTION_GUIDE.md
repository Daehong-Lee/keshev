# 학생용 실행 안내서와 시스템 구성도

이 안내서는 저장소의 `on-client/` 앱을 실행하고 코드·구성의 범위를 확인하기 위한 문서입니다. 기존 `README.md`와 기존 학생 안내서는 덮어쓰지 않습니다. 실제 설치 환경과 실행 결과는 이 문서의 코드 판독 내용과 구분합니다.

## 목적과 기능

케셰브는 로컬 웹 화면에서 로그인 상태, 업무 앱 접근 결과, 보안 기록을 확인하는 학생용 보안 앱 시작 틀입니다. 화면에는 보호 현황, 업무 앱, 보안 기록 영역이 있습니다. 선택적으로 AI 설명과 설치 패키지의 OSV 조회 기능도 제공되지만, 해당 계정·운영 설정이 준비되지 않았거나 연결하지 않은 기본 실행에서는 실제 외부 연결이 보장되지 않습니다.

기존 엔진이 접근 판정·탐지·집행의 원천입니다. AI는 근거 설명을 보조하며, 서버 시작이나 AI 연결 상태만으로 실제 판정·조치가 성공했다고 볼 수 없습니다. `npm run demo`는 예제 자료 표시용이며 실제 사용자·기기·사건·연동을 뜻하지 않습니다.

## 폴더 구조

명령은 `package.json`이 있는 실제 `on-client/` 폴더에서 실행합니다.

```text
on-client/                         앱 작업 폴더
├── package.json                   Node.js 기준 버전과 start/demo/check 스크립트
├── tools/start-alekov.ps1         Windows PowerShell 실행 도구
├── src/server.mjs                 로컬 HTTP 서버, API, 제공 기능 조립
├── src/engine.mjs                 연결 엔진 로딩, disconnected/demo 엔진
├── src/ai/                        앱 AI 서비스·권한·연결 코드
├── src/connection/                호스트 계정 연결 경계
├── src/vulnerabilities/           설치 메타데이터·OSV 조회
├── public/                        제공 HTML·브라우저 로직·스타일
├── student/extension.mjs          학생이 구현하는 화면 표시 함수
├── student/engine-adapter.mjs     제공 호스트 기능을 전달하는 학생 어댑터 경계
└── docs/                          학생·운영 안내 문서
```

## 지원 환경과 버전

| 항목 | 저장소에서 확인한 설정 | 확인 범위 |
|---|---|---|
| Node.js 기준 | `package.json`의 `engines.node`는 `24.19.0` | 설정 파일 판독. 설치된 버전은 미확인 |
| PowerShell 실행 도구 | Node.js 주 버전 22~24 허용, 24.19.0 권장 | 스크립트 판독. PowerShell에서 실행하지 않음 |
| npm 패키지 | `package.json`에 `dependencies`/`devDependencies`가 없음 | 설정 파일 판독 |
| package-lock | 프로젝트 파일 목록에서 `package-lock.json`을 확인하지 못함 | 이 작업공간 기준. 다른 운영 대상 폴더에 lockfile이 있는지는 미확인 |
| 운영체제 | 아래 실행 절차는 Windows PowerShell 스크립트 기준 | 다른 운영체제와 셸은 시험하지 않음 |
| 브라우저 | 로컬 HTTP 주소를 브라우저에 직접 입력 | 브라우저 호환성 시험은 미확인 |

외부 npm 패키지 설치가 실행 스크립트에 필요하지 않습니다. 이 안내서에서는 `npm install`을 실행하라고 요구하지 않습니다. Node.js 설치 여부나 실제 버전은 새 PowerShell에서 `node --version`으로 직접 확인해야 합니다.

## PowerShell에서 실행

### 1. 작업 폴더에서 새 창 열기

파일 탐색기에서 프로젝트의 실제 `on-client/` 폴더를 엽니다. 그 폴더 안에서 `package.json`과 `tools\start-alekov.ps1`이 있는지 확인한 뒤, 주소 표시줄에 `powershell`을 입력하고 Enter를 눌러 새 PowerShell 창을 엽니다. 바로가기나 다른 폴더에서 실행하지 않습니다. 기존 학생 작업과 Git 변경은 지우거나 초기화하지 않습니다.

먼저 기준 버전을 확인할 수 있습니다.

```powershell
node --version
```

기준 버전은 `v24.19.0`입니다. 실행 도구는 22~24도 허용하며 다른 허용 버전이면 기준 버전 안내를 출력할 수 있습니다. 위 명령은 환경에서 직접 실행하지 않았습니다.

### 2. 선택 문법 검사

```powershell
npm run check
```

현재 `package.json`에서 이 스크립트는 `node --check student/extension.mjs`를 실행합니다. 학생 확장 파일의 문법 검사이며 서버 시작, 브라우저 표시, 외부 연결이나 다른 모듈의 통합 검사가 아닙니다. 이 환경에서는 실행하지 않았습니다.

### 3. 앱 시작

기본 실행 도구:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1
```

앱 폴더에서 `npm start`로 실행하는 것도 가능합니다. 기본 포트는 `5189`입니다.

```powershell
npm start
```

PowerShell 도구는 앱 폴더·Node.js 버전·포트 사용 여부를 확인하고 `src/server.mjs`를 시작합니다. 정상 시작 시 도구가 다음과 비슷한 안내를 출력해야 합니다.

```text
케셰브가 켜졌습니다. 브라우저에서 http://127.0.0.1:5189/ 을 여세요.
서버가 응답한 것만 확인했습니다. AI 연결 상태는 화면에서 따로 확인해 주세요.
```

`npm start`는 서버 코드가 다음 형식의 시작 줄을 출력합니다.

```text
케셰브 연결 확인: http://127.0.0.1:5189
```

그 다음 브라우저에서 아래 주소를 직접 엽니다.

```text
http://127.0.0.1:5189/
```

이 주소에서 로컬 서버 응답을 받았다는 사실은 접근 제어/XDR 또는 AI 게이트웨이 연결 성공이 아닙니다. 실제 실행 시 위 문구가 나오는지는 확인하지 않았습니다.

### 4. 포트가 사용 중일 때

다른 프로그램을 종료하지 말고 실행 도구에 다른 포트를 지정합니다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1 -Port 5190
```

브라우저에서는 `http://127.0.0.1:5190/`을 엽니다. 포트 범위는 도구에서 1024~65535로 제한합니다. 포트 충돌을 실제로 시험하지 않았습니다.

### 5. 예제 화면, 종료와 재실행

예제 자료를 보려면 다음 중 하나를 씁니다.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1 -Demo
```

또는:

```powershell
npm run demo
```

예제는 실제 연결이나 실제 성취를 입증하지 않습니다. 기본 실행은 엔진 연결이 설정되지 않으면 `disconnected`입니다.

기본 PowerShell 실행은 같은 창에서 `Ctrl+C`로 종료합니다. 종료 후 같은 `on-client/` 폴더에서 동일한 실행 명령을 다시 입력해 재실행합니다. 재실행 전에 파일을 지우거나 새 폴더를 만들 필요가 없습니다. 실제 종료·재실행은 확인하지 않았습니다.

## 글로 쓴 시스템 구성도

```text
사용자
  │ 브라우저에서 로컬 주소 열기
  ▼
[브라우저: public/index.html, public/app.js, student/extension.mjs]
  │ 같은 출처의 HTTP/API 요청
  ▼
[이 PC의 Node.js 서버: src/server.mjs]
  ├─ 학생 화면 요청 → student/extension.mjs의 표시 함수
  ├─ 보호 현황·업무 앱·보안 기록
  │    └─ 기본 실행은 미연결 엔진
  │       └─ 담당자가 SDP 호스트 설정을 제공한 경우에만
  │          student/engine-adapter.mjs → 기존 접근 제어/XDR 호스트
  ├─ AI 기능(앱 권한과 연결 설정이 준비된 경우)
  │    └─ 서버의 AI 서비스/연결 모듈 → 설정된 AI 게이트웨이
  └─ 사용자가 패키지 조회를 요청한 경우
       └─ 서버의 프로젝트 스캐너 → 공개 승인 패키지의 OSV 조회
          https://api.osv.dev/v1/querybatch
```

기본 화면 주소는 `http://127.0.0.1:5189/`입니다. 브라우저의 화면 제공과 서버의 API 처리는 로컬 앱의 흐름입니다. 접근 제어/XDR은 담당자가 제공한 SDP 호스트 설정과 호스트 기능이 있을 때만 연결됩니다. AI는 별도 앱 권한과 연결 설정이 필요합니다. OSV는 패키지 조회 기능의 외부 서비스이며 AI 게이트웨이가 아닙니다. 주소가 코드에 있거나 서버가 시작됐다는 것만으로 어느 외부 서비스와의 연결도 확인된 것은 아닙니다.

코드에 정의된 공개 주소와 기본값:

| 용도 | 주소·기본값 | 범위 |
|---|---|---|
| 로컬 앱 | `http://127.0.0.1:5189/` | 기본 주소. 포트 변경 시 실행 명령의 포트를 사용 |
| OSV | `https://api.osv.dev/v1/querybatch` | `src/vulnerabilities/osv.mjs`의 기본 조회 URL |
| 앱 연결 포털·게이트 | `src/ai/connection.mjs`에 기본 출처 정의 | 앱 승인/게이트 사용은 실제 권한·설정에 따름 |

비밀 URL, 토큰, 비밀번호, API 키 또는 자격 파일 내용을 문서·소스·채팅·커밋에 적지 않습니다. 담당자가 별도 설정 파일을 제공하는 경우 경로와 절차는 담당자 안내를 따릅니다. 설정 견본의 비밀값은 문서화하거나 열람하지 않습니다.

## 제공 코드와 학생 작성 부분

| 구분 | 파일·구현 | 역할 |
|---|---|---|
| 학생 작성 | `student/extension.mjs`의 `renderIdentity`, `renderStatus`, `renderAiConnection`, `renderVulnerabilities`, `renderDecision`, `renderEvents`, `renderExplanation`, `renderAction` | 학생 영역에 표시할 UI 구현. 각 단계의 공식 과제에서 지정한 함수만 수정 |
| 제공 화면·브라우저 코드 | `public/index.html`, `public/app.js`, `public/style.css`, `public/vulnerabilities-view.mjs`, `public/ai-connect.mjs` | 화면 골격, 브라우저 동작과 제공 모듈. 단계에서 지시하지 않은 수정을 하지 않음 |
| 제공 앱 서버 | `src/server.mjs` | 로컬 HTTP/API, 오류 응답, 제공 서버 기능 조립 |
| 엔진 기본값·예제 | `src/engine.mjs`의 `loadEngine`, `demoEngine`; 학생 어댑터 `student/engine-adapter.mjs`의 `createEngine` | 기본 엔진 미연결, 명시적 예제 실행, 담당자 제공 호스트 기능 전달 경계 |
| 제공 취약점 조회 | `src/vulnerabilities/project-scan.mjs`의 `createProjectScanner`; `src/vulnerabilities/osv.mjs`의 `buildPackageQueries`, `createOsvClient` | 설정된 대상·승인된 공개 패키지를 정확한 설치 버전으로 OSV와 대조 |
| 제공 AI 서비스 | `src/ai/service.mjs`의 `createOnAiService`; `src/ai/connection.mjs`의 `createAlekovAppConnector`; `src/ai/vault-service.mjs`의 `createVaultOnAiService` | 앱 AI 연결·앱 전용 권한 처리. 실제 서비스 연결은 별도 설정과 권한이 필요 |

학생이 작성하는 화면 확장과 제공 서버·접근 제어/XDR·AI 게이트웨이는 서로 다른 경계입니다. `student/engine-adapter.mjs`가 존재해도 실제 호스트 권한이나 운영 서버가 자동 제공되는 것은 아닙니다. 이 안내서는 제공 코드의 함수 이름과 역할을 코드에서 확인한 것이며, 실제 호스트·AI 연결을 시험했다는 뜻이 아닙니다.

## 장애 확인과 복구

| 증상 | 확인 순서 | 복구 |
|---|---|---|
| `Node.js 가 없습니다` 또는 버전 안내 | 새 PowerShell에서 `node --version`을 확인하고 22~24인지, 기준 24.19.0인지 확인 | 설치·변경은 담당 기준을 따릅니다. 새 PowerShell을 열고 다시 확인 |
| 실행 도구가 앱 폴더가 아니라고 안내 | 현재 위치가 실제 `on-client/`이고 `package.json`, `src/server.mjs`, `tools/start-alekov.ps1`이 있는지 확인 | 파일 탐색기에서 실제 앱 폴더를 열어 그 위치에서 새 PowerShell 실행 |
| 포트 사용 중 | 실행 도구의 메시지에서 사용 중인 포트 확인 | 다른 프로그램은 종료하지 말고 `-Port 5190` 등 다른 포트로 시작하고 브라우저 주소도 맞춤 |
| 서버가 제한 시간 안에 시작하지 않음 | PowerShell 오류 문구 전체, Node 버전, 선택한 포트 확인 | 오류 내용을 보존하고 담당자에게 전달. 문서에 없는 설정 변경이나 파일 삭제 금지 |
| 로컬 주소를 열 수 없음 | 서버 실행 창이 계속 켜져 있는지와 브라우저 포트가 실행 포트와 같은지 확인 | 서버를 종료했다면 같은 폴더에서 다시 시작. 계속 실패하면 오류 문구를 전달 |
| `ENGINE_NOT_CONNECTED` 또는 `disconnected` | 기본 실행인지, 담당자가 SDP 설정을 제공했는지 확인 | 기본 미연결을 성공으로 처리하지 않습니다. 담당자 안내 없이 설정 경로·대상을 만들거나 변경하지 않음 |
| AI 권한·연결 오류 | 화면에 표시된 코드와 `docs/CONNECTION_TROUBLESHOOT.md`를 확인 | 앱 전용 계정·권한을 담당자에게 확인. 키·토큰을 복사하지 않음 |
| 패키지 조회 미설정·일부 실패·확인 불가 | 조회 상태와 `src/vulnerabilities/README.md`의 의미 확인 | 대상 경로·승인 목록을 임의 변경하지 않음. 조회 실패/미조회는 취약점 없음이 아님 |

오류별 복구는 코드가 실제로 안내하는 안전한 확인 범위에 한정합니다. 외부 계정, 운영 서비스, 포트 충돌, 실제 OSV 응답은 이 환경에서 재현하지 않았습니다.

## 이번 문서 작성에서의 확인 범위

| 구분 | 결과 |
|---|---|
| 코드 판독 | `package.json`, 실행 도구, 서버 기본 엔진 및 라우팅, 학생 확장·어댑터, OSV 스캐너와 연결 모듈을 읽고 명령·경계·주소를 문서화함 |
| 실행 검사 | 미실행. 이 작업 환경에는 PowerShell/Node 명령을 실행하는 도구가 없음 |
| 실제 화면 | 미확인. 브라우저를 조작할 수 없음 |
| 설치된 Node.js 버전 | 미확인 |
| 실제 XDR·AI 게이트·OSV 통신 | 미확인. 실제 외부 요청을 하지 않음 |
| 다른 운영체제·브라우저 호환성 | 미확인 |

## 학생이 직접 확인할 순서

기존 작업을 보존한 상태에서 새 PowerShell을 열어 순서대로 확인합니다.

1. 실제 `on-client/`에서 `node --version`과 `npm run check`를 실행합니다. 버전, 종료 코드와 검사 출력만 기록합니다. `npm run check`는 학생 확장 문법만 검사합니다.
2. 같은 폴더에서 기본 실행 도구 명령을 실행하고 정상 시작 문구와 실제 포트를 기록합니다.
3. 안내된 `http://127.0.0.1:<포트>/`를 브라우저에서 열어 화면이 나타나는지 확인합니다. 화면 표시와 실제 XDR/AI 연결은 각각 따로 기록합니다.
4. 실행 창에서 `Ctrl+C`로 종료하고 같은 명령으로 다시 시작합니다.
5. 실행되지 않았거나 관찰하지 못한 항목은 통과로 기록하지 말고 미확인으로 남깁니다. 오류를 시험하려고 운영 설정이나 의존성을 바꾸지 않습니다.

이 작업에서는 위 명령·브라우저 확인을 실행하지 않았습니다. 실제 실행과 화면 확인은 Windows/브라우저 제어가 가능한 로컬 환경에서 수행해야 합니다.

## 21·22단계의 커밋과 비공개 원문 제출

학생 문서와 이번 단계의 코드 변경은 같은 커밋에 저장합니다. 이번 단계가 문서 작성만이라면 기능 코드를 임의로 바꾸지 않습니다. 이미 준비 중인 다른 변경은 먼저 확인하고 보존합니다. 커밋은 이 안내서 작성 작업에서 수행하지 않았습니다.

21·22단계는 과제 화면에 저장소 주소와 제출할 40자리 커밋을 직접 입력합니다. 비공개 저장소를 공개로 바꾸지 않습니다. 비공개 원문이 필요한 경우 과제 화면의 **「비공개 저장소 원문 준비 방법」**을 펼치고 **「원문 전달 도구 받기」**를 누릅니다. ZIP은 프로젝트 밖에 압축 해제하고, JSON 출력용 새 폴더도 프로젝트 밖에 만듭니다. 프로젝트 Git 최상위 폴더에서 PowerShell을 열어 화면이 안내한 `student-source-cli.mjs` 명령을 사용합니다. 도구·출력 경로는 실제 PC 경로로, `--commit`은 제출할 40자리 커밋으로 지정해야 하므로 이 문서는 명령을 추측해 적지 않습니다.

생성된 JSON을 같은 단계의 **「비공개 저장소 원문 묶음」**에서 선택하고 저장소·커밋·단계를 확인한 뒤 제출합니다. 원문 전달 완료와 AI 검토 통과는 서로 다른 상태입니다. 판정과 서버 상태를 확인합니다. 원문 전달만 실패하면 기존 접수를 유지하고 **「원문만 다시 보내기」**를 사용합니다. 실제 제출·업로드·커밋은 수행하지 않았습니다.
