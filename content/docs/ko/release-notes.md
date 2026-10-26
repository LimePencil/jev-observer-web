---
title: "0.4.0의 새로운 기능"
description: "네이티브 Decisions, Box 검사, 확대된 모델 지원과 더 안전한 기록 처리를 제공합니다."
section: "Getting started"
order: 3.5
---

2026년 10월 22일에 출시되었습니다. [Observer 설치 또는 업데이트](/ko/docs/installation#update-an-existing-build).

## 더 다양한 의사결정 형식 {#more-decision-formats}

`--protocol`로 전송 형식을, `--model-profile`로 모델 검증 규칙을, `--provider`로 인증 정보와 비용 귀속을 선택합니다. 기본값은 계속 System One입니다. 네이티브 OpenAI Decisions는 `/v1/decisions`를 사용하며, Cloudflare System One은 응답 래퍼를 그대로 유지합니다.

Decisions는 질문 순서, 선택적 이름, 응답 거부, 타입이 지정된 Choice 값을 보존합니다. 불리언 `true`와 문자열 `"true"`를 서로 구분합니다. 지원되는 TypeSafe와 H2O 프로필에는 Box 기하 정보와 신뢰도가 추가됩니다. Box 관측 기록은 개별적으로 검토할 수 있으며, 스칼라 평균이나 히스토그램은 만들지 않습니다. H2O의 위치를 찾지 못했다는 결과는 대상이 없음을 입증하지 않습니다.

출처를 검토한 카탈로그에는 OneJev, Clef 런타임, Liquid D1, H2O Lightning을 포함해 54개 항목이 있습니다. 저장된 OmniJev와 Jev-Omni 결과는 각각 별도의 오프라인 어댑터로 처리합니다. 카탈로그 조사와 합성 테스트 픽스처는 지원되는 검사 방식을 설명하며, 실제 제공업체의 가용성이나 모델 품질을 입증하지 않습니다. [연결 설정](/ko/docs/connecting)과 [기록 가져오기](/ko/docs/data-and-privacy#import-records)를 참고하세요.

## 캡처와 기록 {#captures-and-history}

Observer는 전달을 마친 뒤 한도 내의 gzip 멤버 하나 또는 zstd 프레임 하나, 지원되는 PNG/JPEG 멀티파트 요청을 검사할 수 있습니다. 전송되는 바이트는 변경되지 않습니다. 지원되지 않거나 너무 큰 검사 데이터는 최소한의 불완전한 기록을 남깁니다. 입력 캡처는 명시적으로 켜야 하며, 한도는 검사하는 본문에 적용되는 것으로 전체 프로세스 메모리의 상한은 아닙니다.

개인정보 보호 검사는 모호한 마스킹과 마스킹으로 변경된 가져오기 식별자가 있으면 작업 전체를 거부합니다. 내보내기는 크기가 제한된 페이지 단위로 데이터를 가져오며, 보존 기간 정리와 전체 기록 삭제는 원자적으로 처리됩니다. 가져오기나 삭제 패널을 닫아도 대기 중인 작업 상태를 유지합니다. 요청 탐색, 저장된 검토 피드백, 타임라인 크기 조절, 전체 날짜 타임스탬프도 개선되었습니다. [데이터와 개인정보](/ko/docs/data-and-privacy) 및 [대시보드 가이드](/ko/docs/dashboard)를 참고하세요.

## 업데이트 전 확인 사항 {#before-updating}

Observer를 종료하고 전체 작업 공간 백업, 데이터베이스 키, 토큰 파일, 제공업체 인증 정보, 이전 실행 파일을 보관하세요.

작업 공간 토큰은 이제 `observer.sqlite.token`처럼 전체 데이터베이스 파일명 뒤에 `.token`을 붙입니다. 이전 `*.access-token` 파일만 있는 작업 공간에는 새 토큰이 생성됩니다. 다시 로그인하고 작업 공간 인증을 사용하는 클라이언트도 갱신하세요. 이전 파일은 그대로 남습니다.

데이터베이스 스키마가 같더라도 **이전 릴리스는 새 Box 기록을 안정적으로 읽을 수 없습니다.** 롤백할 때는 업그레이드된 작업 공간을 별도로 보관하고, 종료된 상태에서 만든 업그레이드 전 스냅샷을 이전 실행 파일과 함께 복원하세요. 바이너리를 바꾸거나 새 기록을 내보내도 하위 호환성이 생기지는 않습니다. [업그레이드 및 롤백 안내](/ko/docs/installation#update-an-existing-build)를 따르세요.

## 검증 범위 {#verification-scope}

릴리스에는 네이티브 패키지 6개와 `SHA256SUMS`가 포함됩니다. 이전 Python 0.7.1 / JavaScript 0.6.0 SDK 검증과, Linux에서 실행하는 현재 Python 0.7.5 / JavaScript 0.7.0 압축·멀티파트 테스트 픽스처는 별개입니다. 이 픽스처는 루프백 제공업체를 사용하며 유료 추론을 실행하지 않습니다. macOS와 Windows 바이너리는 여전히 서명되지 않았습니다.

[전체 릴리스 노트 및 다운로드](https://github.com/LimePencil/jev-observer/releases/tag/v0.4.0).
