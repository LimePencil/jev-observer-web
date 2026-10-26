---
title: "문제 해결"
description: "연결, 누락된 관측 기록, 알 수 없는 비용, 로컬 빌드 문제를 확인합니다."
section: "User guide"
order: 7
---

먼저 프로세스 출력과 대시보드의 수집 상태를 확인하세요. 응답이 성공했다는 것과 관측 기록이 완전히 저장되었다는 것은 별개의 사실입니다. Windows에서는 [설치 안내](/ko/docs/installation)에 있는 실행 파일 경로를 사용할 수 있습니다.

## 대시보드 빌드가 없습니다 {#the-dashboard-build-is-missing}

Rust 실행 파일에는 컴파일할 때 존재하는 대시보드 빌드가 포함됩니다. 먼저 UI를 빌드한 뒤 Rust를 다시 빌드하세요.

```bash
npm ci --prefix ui
npm run build --prefix ui
cargo build --release --locked
```

`./target/release/jev-observer`로 다시 시작하세요. 완성된 릴리스 빌드에는 개발 서버가 필요하지 않습니다.

## 로컬 페이지가 열리지 않습니다 {#the-local-page-will-not-open}

Observer 프로세스가 실행 중인지 확인하고 터미널 출력을 살펴보세요. `http://127.0.0.1:8765` 또는 `--port`로 지정한 포트를 사용합니다.

```bash
curl --user observer http://127.0.0.1:8765/api/health
```

Curl이 비밀번호를 요청하면 작업 공간 액세스 토큰을 입력하세요. Observer가 시작 시 표시한 정확한 경로의 토큰 파일을 사용합니다. 데모 기록과 실제 사용 기록은 서로 다른 토큰을 사용합니다. 다른 프로세스가 포트를 사용 중이면 다른 포트를 선택하고 브라우저 주소와 SDK 기본 URL을 모두 바꾸세요.

```bash
jev-observer --port 8770
```

Observer는 IPv4 루프백에 바인딩됩니다. 원격 애플리케이션이나 다른 컴퓨터에서는 사용자 컴퓨터의 `127.0.0.1` 주소로 Observer에 접근할 수 없습니다.

## 실제 수집 모드를 시작할 때 데이터베이스 키 오류가 납니다 {#live-startup-reports-a-database-key-error}

이 데이터베이스용으로 보관한 64자리 16진수 키를 `JEV_OBSERVER_DB_KEY`로 전달하세요. 키가 없거나 틀리면 실제 수집 모드가 시작되지 않습니다. 이미 암호화된 기록에 사용할 새 키를 생성하지 마세요. [데이터베이스 키 설정](/ko/docs/connecting#save-a-database-key)을 참고하세요. 데모에는 데이터베이스 키가 필요하지 않습니다. 평문 데이터베이스를 마이그레이션하기 전에는 이전 Observer 프로세스를 중지하세요.

## 대시보드나 API가 비밀번호를 요청합니다 {#the-dashboard-or-api-asks-for-a-password}

사용자 이름은 `observer`, 비밀번호는 작업 공간 액세스 토큰입니다. 제공업체 키나 데이터베이스 키를 사용하지 마세요. 기본 토큰 경로는 실제 수집 모드의 경우 `.jev-observer/observer.sqlite.token`, 데모의 경우 `.jev-observer/observer.demo.sqlite.token`입니다. 사용자 지정 데이터베이스는 전체 파일 이름 뒤에 `.token`을 붙이며, 시작 시 정확한 경로가 표시됩니다. 직접 API를 호출할 때도 HTTP Basic 인증이 필요합니다. `curl --user observer`가 토큰 입력을 요청합니다.

기존 `*.access-token` 작업 공간에서 처음 업그레이드하면 Observer가 새 토큰을 만듭니다. 다시 로그인하고 작업 공간 토큰을 사용하는 클라이언트를 갱신하세요. 제공업체 키를 직접 사용하는 호출, 대체 인증 정보를 사용하는 호출, `--upstream-auth none` 호출도 포함됩니다. 등록된 로컬 클라이언트 토큰은 바뀌지 않습니다. [업그레이드 안내](/ko/docs/installation#update-an-existing-build)를 참고하세요.

## 애플리케이션에서 요청할 수 없습니다 {#the-application-cannot-make-a-request}

다음 순서로 확인하세요.

1. 보관한 데이터베이스 키를 전달하고 `--demo` 없이 일반 모드로 시작합니다. 데모에서는 의도적으로 요청 전달을 비활성화합니다.
2. 클라이언트에 맞는 기본 URL을 사용합니다. TypeSafe System One은 오리진만, OpenAI Decisions는 오리진 뒤에 `/v1`을 붙입니다. 클라이언트가 API 경로를 덧붙입니다.
3. 등록된 로컬 클라이언트 토큰 또는 제공업체 키와 `x-observer-access`를 함께 사용합니다. `--upstream-auth none`에서는 작업 공간 토큰을 SDK 인증 정보로 사용합니다.
4. 설정한 업스트림 엔드포인트가 올바르고 사용 가능한지 확인합니다.
5. `--protocol`과 `--model-profile`을 업스트림 및 클라이언트에 맞춥니다. Cloudflare 응답은 `success`/`result` 래퍼를 유지합니다. 래퍼 없는 System One 데이터를 기대하는 클라이언트 대신 연결 패널의 HTTP 예제를 사용하세요.

시스템 인증 정보 저장소가 잠겨 있으면 세션 전용 저장을 사용하세요. 원격 업스트림에는 HTTPS가 필요하며, 업스트림 인증을 사용하지 않는 서버는 루프백이어야 합니다. Observer는 재시도나 리디렉션을 추가하지 않습니다. [연결 예제와 제공업체 설정](/ko/docs/connecting)을 참고하세요.

## 느린 추론이 시간 초과로 끝납니다 {#slow-inference-times-out}

로컬 추론에서는 SDK 제한 시간을 늘리세요. Python은 초 단위(`timeout=180`), JavaScript는 밀리초 단위(`timeout: 180000`)입니다. Observer는 업로드, 추론, 응답 전송 전체에 300초를 허용하며, `--upstream-timeout-secs`로 바꿀 수 있습니다. 둘 중 짧은 제한 시간이 먼저 적용됩니다. 헤더를 받기 전에 Observer 제한 시간에 도달하면 504를 반환합니다. 본문 전송 중에 도달하면 스트림을 끝내고 불완전한 전송으로 기록합니다.

## 호출은 성공하지만 캡처가 불완전합니다 {#calls-succeed-but-captures-are-incomplete}

전송 문제를 진단할 때는 `Accept-Encoding: identity`를 요청하세요. Observer는 하나의 완전한 gzip 멤버나 zstd 프레임, 그리고 지원되는 이미지 multipart 요청을 검사할 수 있으며, 전달되는 바이트는 바꾸지 않습니다. 여러 프레임, 지원하지 않거나 모호한 인코딩, 잘못된 multipart 형식, 중단된 본문은 불완전한 캡처로 남습니다.

원본 및 디코딩된 본문의 크기를 모두 `--capture-limit`과 비교하세요. 기본값은 요청과 응답 본문 각각 256 KiB입니다. 더 큰 본문도 원래 내용은 완전히 전달될 수 있습니다. Multipart에는 파트와 헤더 한도도 있습니다. 고정된 캡처 사유 메시지는 원본 내용을 노출하지 않고 검사 실패를 알립니다. [지원하는 전송 형식](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/capture-decoding.md)을 참고하세요.

[캡처 용량 설정](/ko/docs/configuration#capture-capacity)으로 전체 본문 용량 예산 안에서 한도를 조정한 뒤 실제 작업 부하로 확인하세요.

## 기록에서 요청이 보이지 않습니다 {#requests-are-missing-from-history}

수집 상태에서 누락, 대기열 부하, 쓰기 실패를 확인하세요. 업스트림이 느리면 진행 중인 호출과 쓰기 대기를 모두 담당하는 캡처 슬롯이 소진될 수 있습니다. 가장 최근 저장소 실패에는 시각, 작업, 민감 정보를 제외한 오류 범주가 표시되며, 복구 뒤에도 남아 있을 수 있습니다.

출처, 모델, 검색, 날짜 필터를 확인하고 요청 목록의 페이지를 넘겨 보세요. 요약 수치는 선택한 전체 범위를 집계합니다. 오래된 기록은 보관 기간에 따라 이미 삭제되었을 수 있습니다. 요청 상세 화면은 페이지당 답변 50개를 표시하며, 저장된 기록과 JSONL에는 모든 답변이 남습니다.

수집 상태 카운터는 프로세스를 재시작하면 초기화됩니다. 새로 시작한 프로세스에서 누락 수가 0이라고 해서 보관된 기록이 완전하다는 뜻은 아닙니다.

## 비용이나 사용량을 알 수 없다고 표시합니다 {#cost-or-usage-is-unknown}

OpenRouter가 보고한 유효한 USD 비용을 추정값보다 우선합니다. 다른 제공업체의 `usage.cost` 필드를 USD라고 가정하지 않습니다. 인식할 수 있는 보고 비용이 없으면, 추정에 사용할 수 있는 토큰 사용량과 설정된 두 단가가 모두 필요합니다.

합계를 비교하기 전에 비용 집계 범위와 입력·출력 토큰의 집계 범위를 각각 확인하세요. 보고된 0은 확인된 값이며, 사용량이 없으면 알 수 없음으로 유지합니다. 가져온 애플리케이션 작업으로 토큰 비용을 만들어 내지 않습니다. [비용 추정](/ko/docs/configuration#estimate-costs)을 참고하세요.

## 답변에 검증 경고가 표시됩니다 {#an-answer-has-a-validation-warning}

경고가 있어도 보고된 값은 보존합니다. 그 외의 조건이 유효한 답변은 분포 집계에 포함될 수 있습니다. 형식이 잘못된 답변은 계속 유효하지 않은 것으로 처리합니다. 현재 검증 규칙은 새 캡처와 가져오기에 적용되며, 업그레이드해도 저장된 기록을 다시 분류하지 않습니다. [모델별 해석](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/models.md#compatible-http-servers)을 참고하세요.

## Box 답변에 분포가 없습니다 {#a-box-answer-has-no-distribution}

Box 답변은 좌표와 개별 검토로 살펴보는 도형 정보이며, 단일 수치의 평균이나 도형 히스토그램을 제공하지 않습니다. 유효하지 않은 좌표도 원본 답변을 펼쳐 확인할 수 있습니다. H2O의 `found:false`는 위치를 찾지 못했다는 뜻입니다. 전체 프레임을 덮는 사각형이나 신뢰도 0만으로 대상이 없다고 판단할 수는 없습니다. [Box의 의미](/ko/docs/connecting#inspect-box-answers)를 참고하세요.

## 같은 반복 질문이 여러 그룹으로 나뉩니다 {#a-recurring-question-appears-in-separate-groups}

출처, 키, 전체 정의, 표시 순서, 작업 버전을 비교하세요. 그룹화에 사용하는 값이 바뀌면 별도 버전이 만들어질 수 있습니다. 민감 정보가 가려진 정의는 원래 정의와 동일한지 Observer가 확인할 수 없으므로 의도적으로 분리합니다.

규칙이 입력 상태에 담겨 있다면 의미 있는 `x-observer-task-version`을 추가하세요. 맥락이 없으면 검증되지 않음으로 표시합니다. 표현이 다른 질문을 자동으로 합치는 보편적인 의미 매핑은 없습니다.

## 대시보드 새로고침이 느립니다 {#dashboard-refresh-feels-slow}

출처나 날짜 범위를 줄이고 실행 중인 컴퓨터의 부하를 확인하세요. 대시보드 조회에는 45초를 허용하고, 5초 뒤부터 느린 조회 안내를 표시합니다. 조회 범위가 넓으면 이 제한 시간을 넘길 수도 있습니다. 새로고침은 현재 스냅샷 조회가 끝난 뒤 다음 조회를 시작합니다.

일시 중지하거나 상세 패널을 열면 화면은 고정되지만 수집은 계속됩니다. 질문 그룹의 비교 지표는 해당 그룹을 열 때 불러옵니다. 성능은 작업 부하와 보관 기록에 따라 달라지므로 제한 시간이 지연 시간을 보장하지는 않습니다.

[릴리스의 성능 한도](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/storage.md#storage-and-operating-limits)를 참고하세요.

## 가져오기가 실패합니다 {#an-import-fails}

Observer JSONL, JevRouter receipt, Decision request/response capture 중 원본에 맞는 형식을 선택하세요. 마지막 형식의 식별자는 계속 `systemone-capture`입니다. 네이티브 Decisions나 Cloudflare 구조에는 `protocol`을, 필요한 경우 `model_profile`을 설정하세요. 각 배치는 기록 10,000개와 UTF-8 텍스트 8 MiB 이내여야 합니다. 정규화에는 기록별·배치별 추가 한도가 있습니다. 413은 크기나 처리량 초과, 400은 잘못된 형식이나 지나치게 깊은 중첩을 뜻합니다. 두 경우 모두 배치의 일부만 저장하지 않습니다.

개인정보 필터링으로 안정적인 가져오기 식별자가 바뀌거나, 유효하지 않은 검증 메타데이터가 유효해 보이게 되는 경우에도 배치 전체를 거부합니다. 민감하지 않은 안정적인 ID를 사용하고, 보호 기능을 제거하는 대신 원본 데이터를 수정하세요.

큰 파일은 완전한 JSONL 줄 사이에서 나누세요. 개별 기록 하나가 너무 크면 파일을 나누는 것만으로는 해결되지 않습니다. 가져오기는 한 번에 하나만 실행됩니다. 중복 수는 같은 이벤트 ID를 이미 가져왔다는 뜻입니다. [기록 가져오기](/ko/docs/data-and-privacy#import-records)를 참고하세요.

## 로컬 API 호출에서 403을 반환합니다 {#a-local-api-call-returns-403}

설정한 포트와 루프백 URL을 사용하세요. 브라우저 오리진은 로컬 수신 주소와 일치해야 합니다. 로컬 API를 통해 데이터를 변경하는 요청에는 `X-Observer-Request: 1`도 필요하며, 대시보드는 이를 자동으로 포함합니다.

API 호출에는 위에서 설명한 HTTP Basic 인증도 필요합니다. 제공업체 키를 직접 사용하거나 프로세스의 대체 인증 정보를 사용하는 프록시 호출에는 `x-observer-access`에 작업 공간 토큰을 넣어야 합니다. 대체 인증 정보 사용 시에는 `application/json`도 필요합니다. 등록된 로컬 클라이언트 토큰에는 추가 액세스 헤더가 필요하지 않습니다.

사용자 지정 연동은 [로컬 API](/ko/docs/architecture#local-api)를 참고하세요. 프런트엔드 개발 서버에는 로컬 개발 용도로 범위를 제한한 API 프록시가 이미 설정되어 있습니다.
