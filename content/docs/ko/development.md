---
title: "로컬 개발"
description: "Observer를 빌드하고 대시보드를 실행한 뒤 변경 사항을 검증합니다."
section: "Developer guide"
order: 8
---

[애플리케이션 저장소](https://github.com/LimePencil/jev-observer/tree/v0.4.0)에는 Rust 실행 파일과 React 대시보드가 있습니다. 이 문서 웹사이트는 별도의 Next.js 프로젝트이므로 웹사이트를 변경해도 Observer가 다시 빌드되지는 않습니다.

고정된 Rust **1.98.1** 도구 모음, 네이티브 C 컴파일러, npm이 포함된 Node.js **22.12 이상**을 사용하세요. 소스를 내려받는 방법과 Windows 빌드에 필요한 도구는 [설치 안내](/ko/docs/installation)를 참고하세요.

## 로컬에서 애플리케이션 실행하기 {#run-the-application-locally}

애플리케이션 저장소에서 Rust를 컴파일하기 전에 대시보드를 빌드하세요.

```bash
npm ci --prefix ui
npm run build --prefix ui
cargo run --locked -- --demo
```

`http://127.0.0.1:8765`를 여세요. 사용자 이름은 `observer`이며, 비밀번호는 시작 시 출력된 파일 경로에 있는 데모 토큰입니다. 데모 모드는 별도의 샘플 데이터베이스를 사용하며 제공업체를 호출하지 않습니다.

프런트엔드를 개발하려면 백엔드를 실행한 상태로 두고 다른 터미널에서 Vite를 시작하세요.

```bash
npm run dev --prefix ui
```

Vite가 출력한 주소를 여세요. Vite는 `/api` 요청을 포트 8765로 전달하며, 같은 데모 인증 정보를 사용합니다. Vite 프록시는 자체 개발 요청에 대해서만 Origin을 조정합니다. 실제 요청을 수집하려면 [저장해 둔 데이터베이스 키와 인증 정보를 설정](/ko/docs/connecting)하고 `--demo` 없이 실행한 뒤 SDK 요청을 백엔드의 오리진 주소로 보내세요.

## 배포용 실행 파일 빌드하기 {#build-the-distributable-executable}

```bash
npm run build --prefix ui
cargo build --release --locked
./target/release/jev-observer --demo
```

Windows에서는 `.\target\release\jev-observer.exe --demo`를 사용하세요. 빌드에는 `ui/dist/`가 포함됩니다. 대시보드 소스가 바뀔 때마다 Rust를 빌드하기 전에 프런트엔드를 다시 빌드하세요. 완성된 실행 파일에는 Node.js 런타임이나 별도의 데이터베이스 서비스가 필요하지 않습니다.

## 검사 실행하기 {#run-the-checks}

의존성을 설치하고 대시보드를 빌드한 뒤 다음 검사를 실행하세요.

```bash
cargo fmt --all --check
cargo clippy --locked --all-targets -- -D warnings
cargo test --locked
python3 scripts/test-install.py
python3 scripts/test-decision-capture.py
python3 scripts/test-model-catalog.py
python3 scripts/test-token-layouts.py
npx --prefix ui playwright install chromium
OBSERVER_UI_PREVIEW=1 npm test --prefix ui
cargo build --release --locked
OBSERVER_BINARY="$PWD/target/release/jev-observer" npm run test:integration --prefix ui
```

환경 변수를 지정하는 명령은 Bash 기준입니다. 브라우저 상호작용 테스트는 합성 API 픽스처를 사용합니다. 통합 테스트는 임시 데모 작업 공간과 암호화된 실제 수집 작업 공간에서 실제 인증 백엔드와 내장 대시보드를 함께 검사하며, 제공업체를 호출하지 않습니다. Rust 테스트는 전달, 저장, 정규화, 실패 처리를 다룹니다.

프로덕션 미리보기 검사는 [UI 테스트 안내](https://github.com/LimePencil/jev-observer/blob/v0.4.0/ui/README.md)를, 릴리스 메타데이터와 라이선스를 포함한 전체 검사는 [CI 워크플로](https://github.com/LimePencil/jev-observer/blob/v0.4.0/.github/workflows/ci.yml)를 참고하세요.

## SDK 호환성 검사 재현하기 {#reproduce-sdk-compatibility}

두 개의 별도 루프백 픽스처가 테스트용 인증 정보를 사용하며, 제공업체를 호출하지 않습니다.

| 픽스처                                 | 고정된 Python / JavaScript 버전                  | 검사 범위                                                                 |
| -------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| `scripts/sdk-compatibility.py`         | `typesafe-sdk==0.7.1` / `@typesafe-ai/sdk@0.6.0` | 기존 SDK의 비압축 전달, 그룹화, 민감 정보 마스킹, 사용량 및 비용 집계     |
| `scripts/current-sdk-compatibility.py` | `typesafe-sdk==0.7.5` / `@typesafe-ai/sdk@0.7.0` | 작은 JSON, 기본 zstd 압축, 압축된 이미지 멀티파트, 명시적인 압축 비활성화 |

현재 SDK 픽스처는 Linux에서 실행됩니다. 이 검사만으로 모든 플랫폼에서 현재 SDK의 동작이 확인되는 것은 아닙니다. [전송 데이터 처리 규칙](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/capture-decoding.md)도 비압축 데이터만 다루는 이전 픽스처와 다릅니다. 릴리스 빌드 후 검사를 재현하려면 잠금 파일과 CI에서 사용하는 Python 3.12로 격리된 환경에 의존성을 설치하고, 아직 존재하지 않는 출력 파일명을 선택하세요. 실행기는 기존 결과를 덮어쓰지 않습니다.

```bash
python3.12 -m venv .venv-current-sdk
.venv-current-sdk/bin/python -m pip install -r fixtures/current-sdk/python-requirements.txt
npm ci --prefix fixtures/current-sdk --ignore-scripts --no-audit --no-fund
.venv-current-sdk/bin/python scripts/current-sdk-compatibility.py \
  --binary target/release/jev-observer \
  --node-sdk "$PWD/fixtures/current-sdk/node_modules/@typesafe-ai/sdk" \
  --output current-sdk-result.json
```

이전 실행기와 별도로 수행한 실제 추론 검증은 [기존 호환성 검사 안내](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/compatibility.md)를 참고하세요. 합성 픽스처는 제공업체의 실제 이용 가능 여부나 모델 품질을 검증하지 않습니다.

## 대표적인 부하 측정하기 {#measure-representative-load}

릴리스 빌드 후 새로운 출력 파일을 지정해 측정을 하나씩 실행하세요.

```bash
node scripts/benchmark.mjs --binary=target/release/jev-observer \
  --rate=100 --seconds=60 --baseline-seconds=5 --upstream-ms=25 \
  --dashboard-search=urgency --output=reports/benchmarks/local-check.json
```

측정 도구는 루프백 모의 서버와 임시 암호화 데이터베이스를 사용합니다. 지연 시간과 함께 실행 파일, 호스트, 워크로드, 수집 누락을 기록하세요. 결과를 비교할 때는 빌드나 다른 부하 테스트를 동시에 실행하지 마세요.

[성능 보고서](https://github.com/LimePencil/jev-observer/blob/v0.4.0/docs/performance.md)에는 처리 한도가 있는 민감 정보 마스킹 진단, 암호화된 0.2.0 측정값, 이전 평문 데이터 측정값이 포함되어 있습니다. [0.3.1 대규모 기록 검사](https://github.com/LimePencil/jev-observer/blob/v0.4.0/reports/validation/broad-history/README.md)는 쿼리의 정확성, 시작 시 인덱스 생성, 롤백을 다룹니다. [10월 검증 기록](https://github.com/LimePencil/jev-observer/blob/v0.4.0/reports/validation/october-2026/README.md)에는 이후 개선 사항의 검증 근거가 있습니다. 각 결과는 명시된 소스와 워크로드에만 적용되며, 0.4.0의 보편적인 처리 용량을 보장하지 않습니다.
