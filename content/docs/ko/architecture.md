---
title: "아키텍처와 로컬 API"
description: "프록시, 로컬 기록, 대시보드 API의 구조를 알아봅니다."
section: "Developer guide"
order: 9
---

Observer 0.4.0은 설정된 하나의 업스트림으로 요청을 전달하고, 백그라운드 수집기는 크기가 제한된 복사본을 저장합니다. 브라우저는 정규화된 로컬 기록을 읽습니다.

```text
Application -> Local HTTP proxy -> Model provider or local server
                     |
              bounded capture
                     |
              background writer
                     |
                   SQLite <- Local API <- Dashboard
```

## 코드 구조 {#code-map}

| 위치                                                   | 역할                                                                  |
| ------------------------------------------------------ | --------------------------------------------------------------------- |
| `src/main.rs`, `src/config.rs`                         | 시작, CLI 설정, 종료                                                  |
| `src/access.rs`, `src/credentials.rs`                  | 작업 공간 인증, 클라이언트 토큰, 제공업체 키                          |
| `src/server.rs`, `src/server/`                         | HTTP 구성, 전달, 접근 보호, 로컬 API, 내장 정적 파일                  |
| `src/collector.rs`                                     | 캡처 슬롯 예약, 백그라운드 기록, 수집 상태 카운터                     |
| `src/model.rs`, `src/model/`, `src/normalized_json.rs` | 전송 데이터 디코딩, 정규화, 개인정보 보호, 검증, 한도가 있는 가져오기 |
| `src/catalog.rs`, `src/model_catalog.json`             | 오프라인 모델 카탈로그와 검증 프로필                                  |
| `src/store.rs`, `src/store/`                           | 연결 설정, 쓰기, 쿼리, 보존, 검토 레이블, 내보내기                    |
| `ui/src/App.tsx`, `ui/src/app/`                        | 대시보드 구성과 작업 공간 상태 관리                                   |
| `ui/src/details/`, `ui/src/components/`, `build.rs`    | 상세 화면, 공통 UI, 실행 파일에 정적 파일 포함                        |

[저장소 모듈](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/storage-architecture.md)은 트랜잭션의 관리 주체를 유지합니다. [프런트엔드 모듈](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/frontend.md)은 상세 패널을 닫아도 가져오기, 삭제, 인증 정보, 검토 작업을 계속 유지합니다.

## 전달과 저장 {#forwarding-and-storage}

프록시는 기본적으로 `POST /v1/systemone`을 처리합니다. `--protocol openai-decisions`를 선택하면 `POST /v1/decisions`를 사용하며, `cloudflare-systemone`은 System One 경로와 래퍼가 있는 응답 형식을 유지합니다. `--model-profile`은 인증 정보와 비용 집계에 사용하는 `--provider`와 별개로 검증 방식을 선택합니다. 등록된 로컬 클라이언트 토큰은 전달 전에 제공업체 키로 대체됩니다. 제공업체 키를 직접 사용하는 경우에는 `X-Observer-Access`에 작업 공간 토큰도 필요합니다. `--upstream-auth none`을 사용하는 루프백 서버에서는 작업 공간 토큰으로 호출자를 인증하고 업스트림에 인증 정보를 전달하지 않습니다. [연결 옵션](/ko/docs/connecting)을 참고하세요.

원격 업스트림에는 HTTPS가 필요합니다. 전달 과정에서는 리디렉션, 자동 재시도, 자동 응답 압축 해제를 비활성화해 실제 전송 바이트를 유지합니다. 업스트림 제한 시간에는 업로드, 추론, 응답 전송이 모두 포함됩니다. 기본값은 300초이며 `--upstream-timeout-secs`로 설정할 수 있습니다. 카탈로그 항목을 선택하면 설정 안내가 표시되지만 현재 업스트림은 바뀌지 않습니다.

전달은 캡처 슬롯 예약이나 관측 큐의 빈자리를 기다리지 않습니다. 기록 부하가 높으면 관측이 누락되고 수집 상태에 반영됩니다. 본문이 너무 크거나 인코딩을 지원하지 않거나 전송이 중단되면 캡처가 불완전할 수 있습니다. 기록기는 전달 후 한도가 있는 gzip 멤버 하나 또는 zstd 프레임 하나와 지원되는 PNG/JPEG 멀티파트 요청을 검사할 수 있습니다. 원본 본문과 디코딩된 본문은 각각 `--capture-limit` 이내여야 합니다. 지원하지 않는 데이터는 고정된 사유를 포함한 최소한의 불완전 기록으로 남습니다. 이 한도는 전체 메모리 사용량의 상한이 아닙니다. [캡처된 전송 데이터의 한도](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/capture-decoding.md)를 참고하세요.

하나의 백그라운드 기록기가 기록을 정규화하고 묶어서 저장합니다. 실제 사용 기록은 SQLCipher로 암호화되며 `JEV_OBSERVER_DB_KEY`가 필요합니다. 데모 기록과 내보낸 파일은 평문입니다. 데이터베이스 작업은 비동기 HTTP 실행기 밖에서 처리합니다. 필터를 적용한 내보내기는 정수 식별자를 한 번 선택한 뒤 새 트랜잭션마다 정해진 크기의 페이지를 읽습니다. 보존 정책과 전체 기록 삭제는 하나의 트랜잭션 안에서 처리 행 수가 제한된 쿼리를 사용하며, 버전 수 캐시는 하나의 읽기 스냅샷에만 속합니다.

## 기록 해석 규칙 {#record-semantics}

하나의 요청에 여러 답변이 있어도 사용량과 비용은 상위 요청에 속합니다. 없는 값은 알 수 없는 상태로 유지하며, 실패하거나 유효하지 않은 답변은 유효한 분포에 포함하지 않습니다. 변경된 정의, 표시 순서, 지정된 작업 버전은 서로 구분할 수 있습니다.

네이티브 Decisions는 질문 순서, 선택적 이름, 응답 거부, 타입이 있는 Choice 값을 유지합니다. 불리언 `true`는 문자열 `"true"`와 다릅니다. Score 평가 기준의 순서와 레이블도 유지합니다. 검토된 TypeSafe와 H2O 프로필은 Box의 좌표와 신뢰도를 지원하지만 스칼라 평균이나 히스토그램을 만들지 않습니다. H2O에서 위치를 찾지 못했다는 결과는 대상이 없다는 근거가 아닙니다.

모델 프로필은 보고된 값과 검증 경고를 유지합니다. 가져온 작업은 출처 정보를 유지하며, 가져오기는 전달된 주장을 그대로 신뢰하지 않고 유효성과 그룹화를 다시 계산합니다. 지원하는 응답 구조와 매핑은 [모델 및 캡처 규칙](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/models.md)을 참고하세요.

## 로컬 API {#local-api}

대시보드 파일과 API 엔드포인트는 HTTP Basic 인증을 사용합니다. 사용자 이름은 `observer`이며, 비밀번호는 시작 시 파일 경로가 출력되는 작업 공간 접근 토큰입니다. 데이터를 변경하는 요청에는 `X-Observer-Request: 1`도 필요합니다. Host, Origin, 브라우저의 교차 사이트 요청 검사가 로컬 서비스를 보호합니다.

| 메서드와 경로                                     | 용도                                     |
| ------------------------------------------------- | ---------------------------------------- |
| `GET /api/dashboard`                              | 필터가 적용된 요약, 타임라인, 그룹, 요청 |
| `GET /api/health`                                 | 별도의 수집 및 유지 관리 상태            |
| `GET /api/settings`                               | 공개 설정과 오프라인 모델 카탈로그       |
| `GET /api/credentials`                            | 비밀 값을 제외한 제공업체 키 상태        |
| `PUT /api/credentials`, `DELETE /api/credentials` | 제공업체 키 등록, 교체, 삭제             |
| `GET /api/requests/{id}`                          | 전체 정규화 기록                         |
| `GET /api/groups/{id}`                            | 그룹 상세 정보와 버전 비교               |
| `POST /api/requests/{id}/label`                   | 답변 하나에 검토 레이블 지정             |
| `POST /api/import`                                | 기록 가져오기                            |
| `GET /api/export`                                 | JSONL 또는 CSV 다운로드                  |
| `DELETE /api/data`                                | 로컬 기록 삭제                           |

필터에는 `source`, `model`, `window`, `group`, `status`, `search`가 있습니다. 시간 범위는 `1h`, `24h`, `7d`, `all`이며 기본값은 `24h`입니다. `status=error`는 실패한 요청을 선택합니다. 선택 사항인 `from`과 `to`는 양 끝을 포함하는 Unix 밀리초 범위입니다. 요청 및 그룹 커서로 목록의 페이지를 이동해도 요약과 내보내기는 선택한 전체 범위를 유지합니다.

```bash
# Curl prompts for the workspace token.
curl --user observer --get http://127.0.0.1:8765/api/dashboard \
  --data-urlencode 'window=1h' \
  --data-urlencode 'source=my-application'
```

레이블은 `{"key":"department","label":"correct"}` 형식으로 지정하며 값은 `correct`, `incorrect`, `unknown` 중 하나입니다. 가져오기는 `{"text":"...","format":"observer-jsonl"}` 형식을 사용하며 `systemone-capture`와 `jevrouter-receipt`도 지원합니다. 한 번에 가져올 수 있는 데이터는 디코딩된 텍스트 8 MiB, 기록 10,000개까지이며 정규화와 중첩 깊이에 대한 추가 한도가 있습니다. 거부된 배치는 일부 기록도 저장하지 않습니다. `systemone-capture` 형식은 지원되는 네이티브 형식을 위해 명시적인 `protocol`과 `model_profile`도 받습니다. 민감 정보 마스킹에 충돌이 생기거나 마스킹으로 외부 가져오기 식별자가 바뀌는 경우, 또는 개인정보 필터링으로 유효하지 않은 메타데이터가 유효해지는 경우에는 배치 전체를 거부합니다. 연동을 구현하기 전에 [가져오기 규칙](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/models.md#library-results-and-custom-apis)을 확인하세요.

## 갱신과 내구성 {#updates-and-durability}

대시보드와 수집 상태 폴링은 요청이 겹치지 않도록 각각 독립적으로 실행됩니다. 숨겨진 탭은 폴링을 일시 중지합니다. 표시 중인 대시보드를 일시 중지하거나 상세 정보를 열어도 수집은 멈추지 않습니다. 대시보드 읽기는 45초 후 시간 초과되며, 5초가 지나면 쿼리가 느리다는 안내를 표시합니다. 다른 읽기는 15초 제한을 사용하고, 데이터를 변경하는 요청은 자동으로 재시도하지 않습니다. 넓은 범위의 기록 쿼리 성능은 워크로드에 따라 달라집니다.

종료 시에는 총 15초의 제한 시간 안에서 큐에 있는 캡처를 처리합니다. 강제 종료하면 관측이 유실될 수 있으며, 상태 카운터는 다시 시작할 때 초기화됩니다.

출처: [0.4.0 릴리스 노트](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/releases/0.4.0.md), [서버](https://github.com/LimePencil/jev-observer/blob/v0.4.0/src/server.rs), [저장소](https://github.com/LimePencil/jev-observer/blob/v0.4.0/src/store.rs), [브라우저 API 처리](https://github.com/LimePencil/jev-observer/blob/v0.4.0/ui/src/api.ts).
