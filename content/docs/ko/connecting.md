---
title: "애플리케이션 연결"
description: "암호화된 기록과 로컬 인증을 사용해 System One, 네이티브 Decisions, 로컬 모델을 연결하세요."
section: "Getting started"
order: 3
---

[설치 가이드](/ko/docs/installation)에 따라 Observer를 설치한 뒤 실행 중인 데모가 있다면 `Ctrl-C`로 종료하세요. 소스에서 빌드했다면 아래의 `jev-observer`를 `./target/release/jev-observer`로 바꾸세요.

## 용도에 맞는 키 구분하기 {#know-which-key-to-use}

| 인증 정보            | 사용하는 곳                                                   | 얻는 방법                                                     |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| 데이터베이스 키      | 실제 수집용 Observer를 시작할 때 `JEV_OBSERVER_DB_KEY`로 지정 | 아래 절차로 한 번 생성하고 해당 데이터베이스용으로 보관       |
| 대시보드 접근 토큰   | 사용자 이름 `observer`의 브라우저 로그인 비밀번호             | 데이터베이스 파일명에 `.token`을 붙인 파일, 시작 시 경로 표시 |
| 제공업체 API 키      | 실제 수집 대시보드의 **Connect an application**               | 설정한 업스트림 제공업체 계정에서 발급                        |
| 로컬 클라이언트 토큰 | 애플리케이션 SDK의 `api_key` 또는 `apiKey`                    | 제공업체 키를 등록한 뒤 반환                                  |

데모에는 대시보드 접근 토큰만 필요합니다. `--upstream-auth none`을 사용하는 로컬 서버는 이 작업 공간 토큰을 SDK 인증 정보로 사용하며, 제공업체 키가 필요하지 않습니다.

## 데이터베이스 키 저장하기 {#save-a-database-key}

키를 한 번 생성하고 출력된 64자리 16진수 값을 비밀번호 관리자에 저장하세요. 키를 잃으면 암호화된 기록을 읽을 수 없습니다. Bash에서는 다음을 실행합니다.

```bash
openssl rand -hex 32
```

실제 수집 모드를 시작할 때마다 저장한 키를 읽어 오세요. 다음 명령은 키를 셸 기록에 남기지 않습니다.

```bash
read -r -s -p 'Saved database key: ' JEV_OBSERVER_DB_KEY; echo
export JEV_OBSERVER_DB_KEY
```

Windows PowerShell에서는 다음 명령으로 키를 한 번 생성하세요.

```powershell
$keyBytes = New-Object byte[] 32
$random = [Security.Cryptography.RandomNumberGenerator]::Create()
$random.GetBytes($keyBytes)
$random.Dispose()
[BitConverter]::ToString($keyBytes).Replace('-', '').ToLowerInvariant()
```

출력된 값을 저장한 뒤 실제 수집 모드를 시작할 때마다 다음 블록을 사용하세요.

```powershell
$savedKey = Read-Host 'Saved database key' -AsSecureString
$env:JEV_OBSERVER_DB_KEY = [Net.NetworkCredential]::new('', $savedKey).Password
```

기존 데이터베이스에 사용할 대체 키를 새로 생성하지 마세요. 데모는 데이터베이스 키가 필요하지 않으며 요청 전달을 비활성화합니다.

## 로그인하고 제공업체 키 등록하기 {#sign-in-and-register-a-provider-key}

애플리케이션 디렉터리에서 Observer를 시작하세요.

```bash
jev-observer
```

Windows에서는 `& "$env:LOCALAPPDATA\JevObserver\bin\jev-observer.exe"`를 사용하세요. 다른 제공업체나 로컬 모델에 연결하려면 아래에 있는 해당 업스트림 명령을 대신 사용하세요.

[http://127.0.0.1:8765](http://127.0.0.1:8765)를 여세요. 사용자 이름 `observer`와 `.jev-observer/observer.sqlite.token`의 토큰으로 로그인합니다. 시작 시 정확한 경로가 표시되며, 데모는 `.jev-observer/observer.demo.sqlite.token`을 사용합니다. 전체 데이터베이스 파일명 뒤에 접미사를 붙이므로 `team.db`는 `team.db.token`을 사용합니다.

이전 `*.access-token` 파일만 있는 작업 공간을 업그레이드하면 새 토큰이 생성되고 기존 파일은 그대로 남습니다. 새 토큰으로 로그인하고 `x-observer-access` 또는 `--upstream-auth none`을 사용하는 클라이언트도 갱신하세요. 등록된 로컬 클라이언트 토큰은 변경되지 않으며, 세션 및 시스템 저장 방식의 유지 규칙도 그대로 적용됩니다.

**Connect an application**에서 제공업체 키를 입력하고 세션 전용 저장 또는 운영체제 인증 정보 저장소를 선택하세요. 반환된 로컬 클라이언트 토큰을 애플리케이션의 `JEV_OBSERVER_CLIENT_TOKEN` 환경 변수에 복사하세요. 페이지를 새로 고치거나 닫기 전, 또는 키를 교체하거나 삭제하기 전까지는 패널을 다시 열어 토큰을 복사할 수 있습니다. 토큰은 비공개로 보관하세요. 시스템 저장소를 사용할 수 없거나 잠겨 있으면 세션 전용 저장을 사용할 수 있습니다.

Observer는 요청을 전달하기 전에 로컬 토큰을 제공업체 키로 바꿉니다. 세션 전용 인증 정보는 재시작할 때마다 다시 등록해야 합니다. 시스템 인증 정보 저장소를 사용할 때는 데이터베이스 경로를 동일하게 유지하세요.

System One을 사용할 때 TypeSafe SDK의 기본 URL을 로컬 오리진인 `http://127.0.0.1:8765`로 바꾸세요. `/v1/systemone`을 덧붙이지 마세요. 테스트한 클라이언트가 해당 경로를 직접 추가합니다.

## Python {#python}

```bash
python -m pip install "typesafe-sdk[zstd]==0.7.5"
```

```python
import os
from typesafe_sdk import TypeSafeClient

client = TypeSafeClient(
    api_key=os.environ["JEV_OBSERVER_CLIENT_TOKEN"],
    base_url="http://127.0.0.1:8765",
    headers={
        "x-observer-source": "my-application",
        "Accept-Encoding": "identity",
    },
)
```

기존 System One 호출에 이 클라이언트를 사용하세요. 등록된 로컬 토큰은 추가 접근 헤더가 필요하지 않습니다.

## JavaScript {#javascript}

```bash
npm install @typesafe-ai/sdk@0.7.0
```

```javascript
import { TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient({
  apiKey: process.env.JEV_OBSERVER_CLIENT_TOKEN,
  baseURL: "http://127.0.0.1:8765",
  defaultHeaders: {
    "x-observer-source": "my-application",
    "Accept-Encoding": "identity",
  },
});
```

JavaScript의 옵션 이름은 `baseURL`, Python은 `base_url`입니다.

## 제공업체 키 직접 사용하기 {#use-a-provider-key-directly}

제공업체 키를 SDK 인증 정보로 사용하고, 작업 공간 대시보드 토큰을 담은 `x-observer-access` 헤더를 추가하세요. 등록된 로컬 클라이언트 토큰은 추가 접근 헤더가 필요하지 않습니다. [직접 키 사용 예제 및 대체 인증 정보](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/connection.md#credential-handling-and-metadata)를 참고하세요.

## 읽을 수 있는 캡처 요청하기 {#request-readable-captures}

두 예제 모두 `Accept-Encoding: identity`를 요청합니다. Observer는 원본 바이트를 변경 없이 전달한 뒤, 완전한 gzip 멤버 하나나 zstd 프레임 하나, 지원되는 이미지 멀티파트 요청도 검사할 수 있습니다. 원시 본문과 디코딩된 본문 모두 각각 `--capture-limit` 이내여야 합니다. 형식이 잘못되었거나 지원되지 않거나 모호하거나 너무 큰 본문은 불완전한 캡처를 남깁니다.

입력 캡처는 기본적으로 꺼져 있습니다. `--capture-state`를 사용하면 지원되는 PNG/JPEG 파트를 인라인 검사 데이터로 보관할 수 있지만, 이 데이터가 재실행 가능한 요청임을 보장하지는 않습니다. [전송 형식 및 개인정보 관련 한도](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/capture-decoding.md)를 참고하세요.

## 출처 이름과 작업 버전 지정하기 {#name-sources-and-task-versions}

선택적 메타데이터 헤더는 로컬 문맥을 추가하며 업스트림에 전달하기 전에 제거됩니다.

| 헤더                           | 용도                                                            |
| ------------------------------ | --------------------------------------------------------------- |
| `x-observer-source`            | 애플리케이션을 식별할 출처 이름과 고유한 질문 네임스페이스 지정 |
| `x-observer-task-version`      | 입력 상태에 담긴 규칙의 변경 구분                               |
| `x-observer-adapter: jgrep-v1` | 검토된 특정 패턴에만 일치하는 jgrep 인덱스 계열 어댑터 활성화   |

그룹화에는 출처, 원래 키, 전체 정의, 표시 순서, 작업 버전을 사용합니다. 상태에 담긴 규칙이 바뀌면 작업 버전도 갱신하세요. 문맥이 없으면 검증되지 않은 것으로 취급하며, 마스킹된 정의는 별도로 유지합니다. jgrep 어댑터는 특정 패턴 하나만 인식합니다.

## 업스트림 선택하기 {#choose-the-upstream}

Observer는 기본적으로 네이티브 `POST /v1/systemone` 트래픽을 `https://api.typesafe.ai/v1/systemone`으로 전달합니다. 호환되는 다른 고정 엔드포인트를 선택하려면 다음과 같이 실행하세요.

```bash
jev-observer \
  --upstream https://your-provider.example/v1/systemone
```

각 프로세스는 고정된 업스트림 하나를 사용합니다. 엔드포인트를 바꾸려면 프로세스를 종료하고 다시 시작하세요. 원격 엔드포인트에는 HTTPS가 필요하며, 루프백에서는 HTTP를 사용할 수 있습니다.

전송 형식에는 `--protocol`(`systemone`, `openai-decisions`, `cloudflare-systemone`), 검토된 카탈로그 검증 규칙에는 `--model-profile`, 인증 정보와 비용 귀속에는 `--provider`를 사용하세요. 프로필은 요청에 지정하는 모델 이름과 별개입니다. 카탈로그 항목을 선택하면 설정 안내가 준비되며, 실행 중인 프로세스를 변경하지는 않습니다.

Observer는 재시도나 리디렉션을 추가하지 않습니다. 전체 요청·응답 교환의 제한 시간은 300초입니다. 더 오래 걸리는 호출은 `--upstream-timeout-secs`를 조정하세요. SDK의 제한 시간도 별도로 적용됩니다.

## OpenAI Decisions {#openai-decisions}

저장한 데이터베이스 키를 설정한 상태에서 네이티브 Decisions API용 Observer를 시작하세요.

```bash
jev-observer --upstream https://api.openai.com/v1/decisions \
  --provider openai --protocol openai-decisions --model-profile openai-decisions
```

제공업체 키를 등록하고 반환된 로컬 클라이언트 토큰을 사용하세요. OpenAI 클라이언트의 기본 URL을 `http://127.0.0.1:8765/v1`로 설정하면 `POST /v1/decisions`를 호출합니다. 연결 패널은 Python과 JavaScript 예제를 생성합니다. 이 API에는 Python `openai>=3.26.0` 또는 JavaScript `openai>=7.30.0`이 필요합니다.

네이티브 `input`과 순서가 있는 `questions` 배열을 그대로 유지하세요. Observer는 원래 정의를 보존하며 `true`와 같은 불리언 선택지와 `"true"`와 같은 문자열을 구분합니다. Predicate는 참일 확률로 표시됩니다. 요청한 모델이 해당 계정에서 Decisions를 지원해야 하며, 실제 호출에는 요금이 발생할 수 있습니다. [네이티브 예제](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/connection.md#openai-decisions)를 참고하세요.

## Cloudflare System One {#cloudflare-system-one}

Cloudflare 카탈로그 항목을 선택하고 계정 자리표시자를 실제 값으로 바꾸세요. `--provider cloudflare --protocol cloudflare-systemone`과 함께 해당 항목의 `--model-profile`, 전체 계정·모델 업스트림 URL을 사용하세요. Observer의 로컬 `POST /v1/systemone` 경로로 네이티브 System One JSON을 전송합니다.

패널의 Python HTTP 또는 JavaScript `fetch` 예제를 사용하세요. `result`를 읽기 전에 HTTP 상태와 응답 래퍼의 `success` 필드를 모두 확인해야 합니다. Observer는 전송 시 이 래퍼를 유지하고 내부의 타입이 지정된 응답을 검사합니다. 래퍼 없는 응답을 기대하는 TypeSafe SDK는 이를 직접 처리할 수 없습니다.

## OpenRouter를 통한 Jev 연결 {#jev-through-openrouter}

저장한 데이터베이스 키를 설정한 상태에서 OpenRouter의 System One 엔드포인트로 Observer를 시작하세요.

```bash
jev-observer --upstream https://openrouter.ai/api/v1/systemone
```

OpenRouter 키를 등록하고 로컬 클라이언트 토큰을 SDK에서 사용한 뒤, `jev-1.13`과 같은 Jev 모델을 요청하세요. 추론 비용은 OpenRouter 계정에 청구됩니다. Observer는 호스트 이름을 인식하며, 유효하게 보고된 USD 비용이 있으면 설정한 추정치보다 우선해 표시합니다.

## 로컬 Laya 모델 {#local-laya-models}

영어 체크포인트를 사용하고 `LAYA_API_KEY`를 설정하지 않은 상태로 Laya를 루프백에서 별도로 시작하세요. 저장한 데이터베이스 키를 설정한 뒤 다음을 실행하세요.

```bash
jev-observer --upstream http://127.0.0.1:8000/v1/systemone \
  --upstream-auth none --provider laya
```

작업 공간 접근 토큰을 SDK의 `api_key` 또는 `apiKey`로 사용하고, 로컬 기본 URL과 identity 인코딩을 유지하며, `english` 모델을 요청하세요. CPU 추론에는 Python의 `timeout=180`(초) 또는 JavaScript의 `timeout: 180000`(밀리초)이 필요할 수 있습니다. 더 오래 걸리는 호출은 SDK와 Observer의 제한 시간을 모두 늘리세요.

`--upstream-auth none`은 루프백에서만 사용할 수 있습니다. 이 모드에서도 호출자를 인증하며, 업스트림으로 전달하기 전에 인증 정보를 제거합니다. Laya에 키가 필요하면 bearer 모드에서 해당 키를 등록하세요. [테스트한 Laya 설정과 한도](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/connection.md#laya-and-other-local-system-one-models)를 참고하세요.

## 의사결정 모델의 연결 방법 찾기 {#find-a-decision-model-connection}

**Connect an application → Decision models**에서 호환 서버와 [매핑된 캡처 가져오기](/ko/docs/data-and-privacy#import-records)를 확인하세요. 항목을 선택하면 안내가 표시되며, 실행 중인 업스트림은 변경되지 않습니다. 안내된 프로토콜, 모델 프로필, 제공업체 설정을 따르세요. 여러 업스트림을 동시에 사용하려면 프로세스, 포트, 데이터베이스를 각각 분리하세요.

카탈로그의 54개 항목은 검토된 연결 경로를 문서화합니다. 실제 추론 검증은 OpenRouter를 통한 Jev와 Laya에 한정됩니다. 채팅, 추출, 순위 지정, 사용자 지정 배치 API는 네이티브 전달 범위에 포함되지 않습니다. 프로필과 매핑은 [모델 가이드](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/models.md)를 참고하세요.

## Box 답변 살펴보기 {#inspect-box-answers}

검토된 TypeSafe 및 H2O 프로필은 정규화된 `top`, `bottom`, `left`, `right` 경계값을 가진 Box 답변을 지원합니다. 요청 상세 화면은 이미지를 가져오거나 종횡비를 단정하지 않고 좌표와 단위 평면상의 윤곽을 표시합니다. 신뢰도는 기하 정보와 별개입니다. 그룹은 개별 관측 기록과 검토를 유지하며, 스칼라 평균이나 기하 정보 히스토그램은 만들지 않습니다.

H2O의 `found:false`는 위치를 찾지 못했다는 뜻이며, 대상이 없다는 증거는 아닙니다. 선택적 `present` 정보도 신뢰도와 별개입니다. 원시 답변에는 원래 확장 필드와 유효하지 않은 기하 정보도 보존됩니다. [Box와 제공업체별 의미](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/connection.md#box-geometry-and-provider-extensions)를 참고하세요.

## 연결 확인하기 {#verify-the-connection}

기존 애플리케이션 호출을 실행한 뒤 대시보드에서 해당 출처를 살펴보세요. 응답 상태, 전송 결과, 캡처 완전성, 타입이 지정된 답변을 확인합니다. 유효하게 보고된 OpenRouter 비용이 없고, 사용 가능한 사용량과 [두 요금 설정](/ko/docs/configuration#estimate-costs)도 갖춰지지 않았다면 비용은 알 수 없는 상태로 남습니다.

배포된 애플리케이션은 사용자 컴퓨터의 루프백 주소로 Observer에 접근할 수 없습니다. 이 작업 흐름은 동일한 로컬 리스너에 접근할 수 있는 애플리케이션을 위한 것입니다. 기존 원격 활동을 살펴보려면 지원되는 [기록 가져오기](/ko/docs/data-and-privacy#import-records)를 사용하세요.

## 호환성 검증 범위 {#compatibility-boundary}

현재 Python 0.7.5와 JavaScript 0.7.0의 [Linux 테스트 픽스처](https://github.com/LimePencil/jev-observer/tree/v0.4.0/fixtures/current-sdk)는 입력 캡처를 끈 상태와 켠 상태에서 identity JSON, 기본 zstd, 이미지 멀티파트, 압축 비활성화를 확인합니다. 별도의 이전 Python 0.7.1 및 JavaScript 0.6.0 [모의 테스트](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/compatibility.md#sdk-mock-compatibility)는 전달, 그룹화, 마스킹, 사용량 집계를 검증합니다. 두 테스트 모두 실제 제공업체를 호출하지 않으며 모든 운영체제나 SDK 버전의 동작을 입증하지는 않습니다.

별도의 실제 추론 검증은 OpenRouter를 통한 Jev와 Laya를 대상으로 합니다. 새 프로토콜·프로필의 테스트 픽스처는 검사 동작을 검증하며, 실제 제공업체의 가용성이나 모델 품질을 입증하지 않습니다. 비동기 Python, 브라우저 SDK, 모델 목록 경로는 여전히 검증 범위에 포함되지 않습니다.
