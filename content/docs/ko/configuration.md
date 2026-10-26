---
title: "설정"
description: "업스트림, 보관 기간, 캡처 한도, 비용 추정값을 설정합니다."
section: "User guide"
order: 6
---

Observer는 시작 옵션으로 설정합니다. **Settings(설정)**에서 현재 적용된 설정을 확인할 수 있으며, 변경하려면 Observer를 재시작해야 합니다. 전체 CLI 옵션은 `jev-observer --help`로 확인하세요.

## 수신 주소와 기록 {#listener-and-history}

| 옵션                      | 기본값                                 | 용도                                                               |
| ------------------------- | -------------------------------------- | ------------------------------------------------------------------ |
| `--port`                  | `8765`                                 | `127.0.0.1`에서 사용하는 포트                                      |
| `--db`                    | `.jev-observer/observer.sqlite`        | 기록 저장 위치                                                     |
| `--upstream`              | `https://api.typesafe.ai/v1/systemone` | 하나의 고정 업스트림 엔드포인트                                    |
| `--upstream-auth`         | `bearer`                               | 제공업체 키가 없는 루프백 서버에서만 `none` 사용                   |
| `--upstream-timeout-secs` | `300`                                  | 업로드, 추론, 응답을 모두 포함한 제한 시간. 1–86,400초             |
| `--provider`              | 알려진 호스트를 기준으로 추론          | 인증 정보 및 과금 제공업체. 로컬 모델은 직접 지정                  |
| `--protocol`              | `systemone`                            | 전송 형식: `systemone`, `openai-decisions`, `cloudflare-systemone` |
| `--model-profile`         | 제공업체 기반 대체값                   | 검토된 카탈로그의 검증 규칙. 요청 모델 이름과는 별도               |
| `--retention-days`        | `7`                                    | 최대 기록 보관 일수                                                |
| `--max-records`           | `1000000`                              | 보관 기록 수의 소프트 상한                                         |
| `--demo`                  | 비활성화                               | 별도의 합성 기록 사용. 요청 전달 비활성화                          |

Observer는 IPv4 루프백에만 바인딩됩니다. 상대 데이터베이스 경로는 시작 디렉터리를 기준으로 해석합니다. 데모는 별도의 `*.demo.sqlite` 파일을 사용합니다.

원격 업스트림에는 HTTPS가 필요합니다. 로컬 모델과 모의 서버는 루프백에서 HTTP를 사용할 수 있습니다. URL에는 인증 정보, 쿼리 매개변수, 프래그먼트를 넣을 수 없습니다. 경로가 없는 오리진에는 선택한 프로토콜의 로컬 경로인 `/v1/systemone` 또는 `/v1/decisions`를 사용합니다. Cloudflare에는 계정과 모델을 포함한 전체 엔드포인트가 필요합니다. 기본값이 아닌 프로토콜을 선택할 때는 업스트림을 명시하세요. [연결 예제](/ko/docs/connecting)를 참고하세요.

알 수 없는 모델 프로필을 명시하면 거부합니다. 프로필을 명시하지 않으면 기존의 제공업체 기반 검증 규칙을 대체값으로 사용합니다. 카탈로그 항목을 선택하면 실행 명령을 준비할 뿐, 실행 중인 연결을 바꾸지는 않습니다.

보관 설정값은 양수여야 합니다. 정리는 30초마다 실행됩니다. 기록 수와 보관 기간의 제한이며, 디스크 바이트 수 제한은 아닙니다.

## 인증 정보와 개인정보 {#credentials-and-privacy}

| 설정                  | 용도                                                        |
| --------------------- | ----------------------------------------------------------- |
| `JEV_OBSERVER_DB_KEY` | 실제 사용 기록에 필요한, 저장해 둔 64자리 16진수 키         |
| `TYPESAFE_API_KEY`    | bearer 모드에서 선택적으로 사용하는 대체 제공업체 인증 정보 |
| `--capture-state`     | 입력 상태와 요청·응답 구조의 미디어 필드를 명시적으로 저장  |
| `--redact-key KEY`    | 민감 정보를 가릴 필드 이름 추가. 필요에 따라 반복 지정      |

데이터베이스 키는 환경 변수로 전달합니다. 사용자 이름 `observer`와 시작 시 경로가 표시되는 작업 공간 액세스 토큰으로 로그인하세요. 토큰 파일 이름은 `.jev-observer/observer.sqlite.token`처럼 전체 데이터베이스 파일 이름 뒤에 `.token`을 붙입니다. 기존 `*.access-token` 작업 공간에서 업그레이드한다면 [토큰 업그레이드](/ko/docs/connecting#sign-in-and-register-a-provider-key)를 참고하세요.

bearer 모드에서는 **Connect an application(애플리케이션 연결)**에 제공업체 키를 등록한 뒤 SDK에 로컬 클라이언트 토큰을 사용합니다. `--upstream-auth none`에서는 작업 공간 토큰으로 로컬 인증을 하며, 업스트림에 인증 정보를 보내지 않습니다. [전체 인증 설정](/ko/docs/connecting)을 참고하세요.

입력 캡처를 꺼도 정의와 답변은 저장됩니다. [데이터와 개인정보](/ko/docs/data-and-privacy)를 참고하세요.

## 캡처 용량 {#capture-capacity}

| 옵션               | 기본값                | 범위         |
| ------------------ | --------------------- | ------------ |
| `--capture-limit`  | 본문당 `262144`바이트 | 1–16,777,216 |
| `--capture-slots`  | `1024`                | 1–4,096      |
| `--queue-capacity` | `1024`                | 1–4,096      |

슬롯 하나는 진행 중인 호출부터 쓰기 대기, 영구 저장까지를 담당합니다. 설정한 본문 용량 예산은 다음 조건을 충족해야 합니다.

```text
2 × capture slots × capture limit <= 512 MiB
```

기본값으로 이 예산에 도달하므로 슬롯 수를 늘리려면 본문당 한도를 줄여야 합니다. 버퍼는 필요에 따라 커집니다. 이 값은 프로세스 전체 메모리 상한이 아닙니다. HTTP 버퍼, 디코딩 상태, 파싱된 JSON, 데이터베이스 처리에도 메모리가 필요합니다.

지원되는 gzip/zstd 검사에서는 원본 본문과 디코딩된 본문에 `--capture-limit`을 각각 적용합니다. zstd 윈도우는 8 MiB로 제한하며, 지원되는 이미지 multipart 본문에는 파트와 헤더에 대한 별도 한도가 있습니다. [전송 데이터 검사 한도](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/capture-decoding.md#inspection-formats-and-limits)를 참고하세요.

동시 호출 수와 쓰기 대기 수를 함께 고려해 슬롯을 설정하세요. 저장할 캡처가 잘려도 원래 본문 전체는 전달할 수 있습니다. 캡처 슬롯이나 대기열이 가득 차면 관측 작업을 생략하고 수집 상태에 표시합니다.

## 비용 추정하기 {#estimate-costs}

OpenRouter가 보고한 USD 비용을 추정값보다 우선합니다. 비용을 추정하려면 두 단가를 모두 지정해야 하며, 사용할 수 있는 입력·출력 토큰 수도 필요합니다.

```bash
jev-observer \
  --input-price-per-million 1.00 \
  --output-price-per-million 2.00
```

이 값은 토큰 100만 개당 USD 단가의 예시이며, 제공업체의 실제 가격이 아닙니다. 단가는 유한한 0 이상의 수여야 하며 `0`도 허용합니다. 정보가 없으면 알 수 없음으로 유지합니다. 표시된 합계에는 각 요청을 한 번씩만 반영하며, 일부 요청만 집계된 경우 그 범위를 함께 표시합니다.

Observer는 가격표를 관리하거나 청구서를 계산하지 않습니다. 단가를 바꿔도 저장된 기록을 다시 계산하지 않으며, 합성 샘플 비용은 계속 별도로 표시합니다.

## 적용된 설정 확인하기 {#check-effective-settings}

**Settings(설정)**를 열거나 인증된 로컬 API를 사용하세요.

```bash
curl --user observer http://127.0.0.1:8765/api/settings
```

Curl이 작업 공간 토큰을 입력하라는 메시지를 표시합니다. 응답에는 비밀 값을 제외한 버전, 프로토콜, 모델 프로필, 제공업체, 설정, 오프라인 모델 카탈로그가 포함됩니다. `/api/health`는 같은 인증 방식으로 수집 상태를 제공합니다.

[전체 CLI 참조](https://github.com/LimePencil/jev-observer/blob/v0.4.0/src/config.rs).
