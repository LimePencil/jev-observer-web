---
title: "설치 및 실행"
description: "네이티브 실행 파일을 설치하고 샘플을 살펴본 뒤 애플리케이션을 연결하세요."
section: "Getting started"
order: 2
---

Jev Observer **0.4.0**에는 대시보드, 글꼴, SQLite가 포함되어 있습니다. 미리 빌드된 릴리스를 사용하면 Rust, Node.js, 데이터베이스 서버, 관리자 권한이 필요하지 않습니다.

## 릴리스 설치하기 {#install-a-release}

Linux 및 macOS:

```sh
curl -fsSL https://raw.githubusercontent.com/LimePencil/jev-observer/v0.4.0/install.sh -o install.sh
sh install.sh --version 0.4.0
export PATH="$HOME/.local/bin:$PATH"
jev-observer --demo
```

Windows PowerShell:

```powershell
Invoke-WebRequest https://raw.githubusercontent.com/LimePencil/jev-observer/v0.4.0/install.ps1 -OutFile install.ps1
.\install.ps1 -Version 0.4.0
& "$env:LOCALAPPDATA\JevObserver\bin\jev-observer.exe" --demo
```

설치 프로그램은 패키지 체크섬과 실행 파일 버전을 확인합니다. Unix에서는 `~/.local/bin`, Windows에서는 `%LOCALAPPDATA%\JevObserver\bin`에 설치하며, 셸 프로필을 변경하거나 서비스를 시작하지 않습니다.

[패키지를 직접 다운로드하고 압축을 풀어도](https://github.com/LimePencil/jev-observer/releases/tag/v0.4.0) 됩니다. Windows에서 스크립트 실행을 차단하면 조직의 정책을 따르거나 ZIP에 포함된 `jev-observer.exe`를 사용하세요.

## 지원 패키지 {#supported-packages}

| 플랫폼  | 아키텍처              | 패키지                         |
| ------- | --------------------- | ------------------------------ |
| Linux   | x86-64 / ARM64        | 정적 musl 실행 파일, `.tar.gz` |
| macOS   | Intel / Apple silicon | `.tar.gz`                      |
| Windows | x86-64 / ARM64        | `.zip`                         |

6개 패키지 모두 네이티브 릴리스 검사를 통과했습니다. 릴리스에는 `SHA256SUMS`도 포함되어 있습니다. macOS와 Windows 바이너리는 서명되지 않았으므로 운영체제 정책에 따라 실행이 차단될 수 있습니다. 체크섬은 다운로드한 바이트를 검증하며, 게시자의 신원을 확인하지는 않습니다. WSL2는 Linux 패키지를 사용하며 별도로 테스트하지 않았습니다. [플랫폼 요구 사항](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/installation.md#supported-packages)을 참고하세요.

## 샘플 열기 {#open-the-sample}

[http://127.0.0.1:8765](http://127.0.0.1:8765)를 열고 로그인하세요.

- **사용자 이름:** `observer`
- **비밀번호:** `.jev-observer/observer.demo.sqlite.token`에 있는 토큰

시작 메시지에 정확한 토큰 파일 경로가 표시됩니다. 브라우저의 비밀번호 입력창에 토큰을 복사하는 동안 Observer를 실행한 상태로 두세요.

샘플에는 합성 요청 720개가 들어 있으며 오프라인으로 동작합니다. 제공업체 인증 정보나 데이터베이스 키가 필요하지 않고, 요청 전달은 비활성화됩니다. **Question groups**에서 질문 그룹을 살펴보고 요청을 열어 답변을 확인하세요. 종료하려면 `Ctrl-C`를 누르세요.

데모는 가져온 기록을 포함해 별도의 평문 `*.demo.sqlite` 데이터베이스를 사용합니다. 기록이 비어 있지 않으면 재시작 후에도 유지됩니다. 암호화된 기록이 필요하면 [실제 수집 모드](/ko/docs/connecting)를 사용하세요.

## 일반 수집 시작하기 {#start-normal-collection}

먼저 샘플을 종료하세요. [데이터베이스 키를 생성하고 저장한 뒤](/ko/docs/connecting#save-a-database-key) `JEV_OBSERVER_DB_KEY`로 지정하고 다음을 실행하세요.

```bash
jev-observer
```

Windows에서는 `& "$env:LOCALAPPDATA\JevObserver\bin\jev-observer.exe"`를 사용하세요.

같은 주소에서 사용자 이름 `observer`와 `.jev-observer/observer.sqlite.token`의 실제 수집용 토큰으로 로그인하세요. [애플리케이션을 연결하거나](/ko/docs/connecting) [기록을 가져오면](/ko/docs/data-and-privacy#import-records) 대시보드에 데이터가 표시됩니다. 데이터베이스 키를 잃으면 암호화된 기록을 읽을 수 없으므로 반드시 보관하세요.

## 포트 또는 데이터베이스 선택하기 {#choose-a-port-or-database}

```bash
jev-observer --port 8770 --db ./observer-data/history.sqlite
```

브라우저와 SDK에서 `http://127.0.0.1:8770`을 사용하세요. 상대 데이터베이스 경로는 시작 디렉터리를 기준으로 해석합니다. 해당 데이터베이스에 저장해 둔 동일한 키를 지정해야 합니다. 토큰 경로는 전체 데이터베이스 파일명 뒤에 `.token`을 붙인 `history.sqlite.token`입니다. 데모는 별도의 `history.demo.sqlite`와 `history.demo.sqlite.token`을 사용합니다.

Windows에서 사용자 지정 데이터베이스 디렉터리는 현재 사용자, SYSTEM, 관리자만 접근할 수 있도록 제한해야 합니다. 기본 `.jev-observer` 디렉터리에는 비공개 ACL이 자동으로 적용됩니다.

## 사전 요구 사항 {#prerequisites}

소스에서 빌드할 때만 Git, `rust-toolchain.toml`에 고정된 Rust 도구 모음, 네이티브 C 컴파일러, npm이 포함된 Node.js 22.12 이상이 필요합니다. Windows에는 Visual Studio C++ Build Tools, 네이티브 Windows Perl, NASM도 필요합니다. `PATH`에 Git Bash Perl이 있다면 `$env:OPENSSL_SRC_PERL`을 네이티브 Perl 실행 파일 경로로 설정하세요. [개발 가이드](/ko/docs/development)를 참고하세요.

## 소스에서 빌드하기 {#build-from-source}

대시보드 파일이 실행 파일에 포함되도록 Rust보다 먼저 대시보드를 빌드하세요.

```bash
git clone --branch v0.4.0 https://github.com/LimePencil/jev-observer.git
cd jev-observer
npm ci --prefix ui
npm run build --prefix ui
cargo build --release --locked
./target/release/jev-observer --demo
```

PowerShell에서는 `.\target\release\jev-observer.exe --demo`를 실행하세요. 다른 예제의 `jev-observer`도 이 빌드 경로로 바꾸세요.

## 기존 버전 업데이트하기 {#update-an-existing-build}

Observer를 종료한 뒤 [데이터베이스와 SQLite 부속 파일](/ko/docs/data-and-privacy#back-up-the-database), 현재 및 이전 작업 공간 토큰 파일, 저장한 데이터베이스 키를 백업하세요. 롤백이 필요하다면 제공업체 인증 정보, 이전 실행 파일, 이전의 시작 및 클라이언트 설정도 보관하세요.

0.4.0 설치 프로그램을 다시 실행하세요. 다운로드나 검증에 실패해도 기존 실행 파일은 보존됩니다. 설치만으로 기록이 변경되지는 않지만, 새 실행 파일을 시작하면 지원되는 쿼리 인덱스를 갱신하거나 이전 평문 기록을 마이그레이션할 수 있습니다. 기록이 많으면 인덱스 생성에 추가 시작 시간과 디스크 공간이 필요할 수 있습니다.

이전 `*.access-token` 파일만 있는 작업 공간을 업그레이드하면 0.4.0은 새 `<database-filename>.token` 경로에 새 토큰을 만들고 기존 파일은 그대로 둡니다. 새 토큰으로 다시 로그인하고 Basic 인증, `X-Observer-Access`, `--upstream-auth none`으로 작업 공간 인증을 사용하는 클라이언트도 갱신하세요. 이 토큰 경로 변경은 등록된 `jo_local_` 토큰, 저장된 제공업체 인증 정보, 데이터베이스 키를 바꾸지 않습니다. 세션 전용 인증 정보는 이전과 마찬가지로 재시작 시 만료됩니다.

**새 Box 기록은 이전 버전의 읽기 기능과 호환되지 않습니다.** 스키마가 같더라도 이전 대시보드나 그룹 쿼리가 실패할 수 있습니다. 이전 버전은 네이티브 Decisions와 새 프로토콜·프로필 플래그도 지원하지 않습니다. 실행 파일을 바꾸거나 새 기록을 JSONL로 내보내도 이 기록에 하위 호환성이 생기지는 않습니다.

롤백할 때는 업그레이드된 작업 공간을 별도로 보관하고, 종료된 상태에서 만든 업그레이드 전 스냅샷을 이전 실행 파일 및 설정과 함께 복원하세요. 해당 스냅샷에는 이후에 수집한 관측 기록이 없습니다. 두 토큰 파일 모두 비공개로 보관하세요. 이전 실행 파일은 기존 토큰을 사용합니다. 해당 작업 공간을 사용하는 모든 Observer 프로세스를 종료한 상태에서만 파일을 복원하세요.

Unix 데이터베이스 경로에 유효하지 않은 UTF-8 바이트가 포함되어 있으면 인증 정보 경로 변경 후 제공업체 키를 다시 등록하고 로컬 클라이언트 토큰을 갱신해야 합니다. 유효한 UTF-8 경로는 기존 인증 정보 계정을 유지합니다. 이후 버전에서 제공업체 키를 교체한 뒤 0.1.0으로 다운그레이드하는 경우에도 재등록이 필요합니다. SQLite만 복원해도 운영체제 인증 정보 저장소의 항목까지 복원되지는 않습니다. [전체 백업 및 롤백 가이드](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/installation.md#history-backups-and-downgrades) 또는 [문제 해결](/ko/docs/troubleshooting)을 참고하세요.
