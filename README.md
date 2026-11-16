# QwQ 블로그

GitHub Pages용 정적 사이트입니다. 빌드 과정이나 외부 서비스 없이 `main` 브랜치의 루트에서 배포할 수 있습니다.

## 내용 바꾸기

| 파일 | 내용 |
| --- | --- |
| `profile.png` | 메인 페이지와 헤더에 표시하는 프로필 사진. 같은 이름의 PNG로 덮어쓰세요. 현재는 GitHub 계정 이미지입니다. |
| `desc.json` | 메인 타이틀 아래에 표시할 자기소개를 JSON 문자열 하나로 작성합니다. 개행은 `\n`을 사용합니다. |
| `summary.json` | `[ {"start":"2024.03","end":"2024.12","desc":"내용"} ]` 형식의 이력 배열입니다. `end`를 생략하면 `시작일 ~`로 표시됩니다. |
| `projects.json` | 프로젝트명을 키로 하는 객체입니다. 각 프로젝트에는 `desc`, `start`, 선택 사항인 `end`, `tags` 배열을 넣습니다. |
| `achievements.json` | 성과명을 키로 하는 객체입니다. 각 성과에는 `desc`, `tags`, `achv` 배열을 넣습니다. 현재는 빈 객체 `{}`입니다. |
| `contact.json` | 서비스별 `icon` 이미지 URL 또는 로컬 경로, 선택 사항인 `link`, 작은 상단 문구인 `category`를 적습니다. 링크가 없어도 카드는 동일하게 표시되며, 링크가 있을 때만 화살표와 이동 기능이 생깁니다. |

`[Google](https://google.com)`처럼 자기소개, 이력, 프로젝트·성과 설명에 Markdown 링크를 넣을 수 있습니다. 이메일은 `[메일 보내기](name@example.com)`처럼 적습니다. 다른 HTML은 텍스트로 처리됩니다.

프로젝트·성과 설명의 **첫 줄**은 접힌 카드에 표시되고, 두 번째 줄부터는 카드를 열어 볼 수 있습니다. 태그는 이름 오른쪽에 표시합니다. 태그 필터에서 여러 항목을 체크하면 **OR** 조건으로 검색합니다.

프로젝트의 종료일이 없으면 날짜를 `시작일 ~`로 표시합니다.

프로젝트와 성과 슬롯을 강조하려면 해당 항목에 `"highlight": true`를 넣으세요. 슬롯의 왼쪽 위와 오른쪽 아래에 가로선이 긴 청록색 모서리 표시가 나타납니다. 생략하거나 `false`로 두면 일반 슬롯으로 표시됩니다.

`achievements.json`의 `achv` 항목마다 카드 오른쪽에 정사각형 타일 하나가 생깁니다. 각 항목의 `desc`는 타일 위, `date`는 아래에 작게 보이고, 나머지 수치 필드의 **값**이 가운데 크게 표시됩니다. 날짜는 `YYYY.MM.DD` 형식입니다.

```json
{
  "예시 대회": {
    "desc": "대회 설명",
    "tags": ["CTF"],
    "highlight": true,
    "achv": [
      {"desc": "전체 순위", "rank": "12위", "date": "2026.11.16"}
    ]
  }
}
```

메인 페이지는 스크롤 없는 한 화면으로 구성했습니다. 왼쪽에는 타이틀, 자기소개, 이력을 두고 오른쪽에는 프로필 사진을 둡니다. 이력은 시작일 기준 최신순으로 정렬되며, 한 번에 최대 4개가 보이는 이력 영역에서만 스크롤됩니다.

현재 이력과 프로젝트 데이터는 구조를 보여 주는 예시입니다. 실제 내용을 입력한 뒤 공개하세요. 성과 데이터는 비어 있으며, GitHub 링크 외의 연락처도 아직 비어 있습니다.

연락처 아이콘은 `contact.json`의 URL에서 불러옵니다. 현재 아이콘은 URL에서 청록색으로 지정하고 `"tint": false`로 CSS 색상 보정을 끕니다. 새 아이콘은 투명 배경 SVG나 PNG를 넣으면 기본적으로 테마색에 맞춰집니다. 원래 색을 유지하려면 `"tint": false`를 추가하세요. `label`은 서비스 이름, `category`는 그 위의 작은 문구(예: `CODE`)입니다. 아이콘 URL이 작동하지 않으면 서비스 이름의 앞 두 글자를 표시합니다.

```json
{
  "mastodon": {
    "icon": "https://cdn.simpleicons.org/mastodon",
    "link": "https://mastodon.social/@example",
    "label": "Mastodon",
    "category": "SOCIAL"
  }
}
```

현재 Instagram·GitHub·Gmail 아이콘은 [Simple Icons](https://simpleicons.org/)에서, BOJ·CTFtime의 범용 코드·깃발 아이콘은 [Lucide](https://lucide.dev/)에서 불러옵니다. 새 아이콘도 각 사이트의 SVG 주소를 `icon`에 넣으면 됩니다.

## GitHub Pages

GitHub 계정과 저장소 이름은 `QwQP0`이고, 블로그에 표시하는 닉네임은 `QwQ`입니다. GitHub Pages는 **Deploy from a branch → main → /(root)**로 설정되어 있습니다. 배포 주소는 [https://qwqp0.github.io/](https://qwqp0.github.io/)입니다. `/index/`, `/projects/`, `/achievements/`, `/contact/`를 사용할 수 있으며 `/project/`도 프로젝트 페이지로 열립니다.

로컬에서는 파일을 직접 열면 JSON 로딩이 제한될 수 있습니다. 정적 HTTP 서버로 미리보기 하세요. 예: `npx serve .`

## 테마

이미지 배경은 사용하지 않습니다. 색과 그라데이션은 `assets/style.css` 상단의 CSS 변수 및 `body`, `.hero`, `.page-intro`에서 바꿀 수 있습니다. 폰트는 Google Fonts를 사용하며, 연결되지 않아도 시스템 폰트로 표시됩니다.
