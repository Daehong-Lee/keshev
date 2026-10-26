// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions } = {}) {
      const root = document.createElement('section');
      const modeLabels = {
        demo: '예제 자료(demo)',
        disconnected: '연결 없음(disconnected)',
        unknown: '확인 불가(unknown)',
      };
      const statusLabels = {
        device: {
          compliant: '정상(compliant)',
          noncompliant: '점검 필요(noncompliant)',
          unknown: '확인 불가(unknown)',
        },
        session: {
          active: '사용 중(active)',
          expired: '만료(expired)',
          revoked: '취소(revoked)',
          unknown: '확인 불가(unknown)',
        },
      };
      const addText = (parent, text) => {
        const line = document.createElement('p');
        line.textContent = text;
        parent.append(line);
      };
      const addSection = (title, resource) => {
        const section = document.createElement('section');
        const heading = document.createElement('h3');
        heading.textContent = title;
        section.append(heading);
        const modeLabel = modeLabels[resource?.mode] || (resource?.mode === 'connected' ? '' : modeLabels.unknown);
        if (modeLabel) addText(section, modeLabel);
        root.append(section);
        return section;
      };
      const showFailure = (section, resource) => {
        const message = typeof resource?.error?.message === 'string' && resource.error.message.length > 0
          ? resource.error.message
          : '오류 메시지가 제공되지 않았습니다.';
        const unverified = ['CONTRACT_MISMATCH', 'ENGINE_RESULT_UNVERIFIED'].includes(resource?.error?.code);
        addText(section, `${unverified ? '확인 불가' : '연결 실패'}: ${message}`);
      };
      const showStatus = (section, resource) => {
        if (resource?.status === 'loading') {
          addText(section, '불러오는 중');
          return false;
        }
        if (resource?.status === 'error') {
          showFailure(section, resource);
          return false;
        }
        if (resource?.status !== 'ok' || !resource.data) {
          addText(section, '확인 불가');
          return false;
        }
        return true;
      };

      const meSection = addSection('로그인 사용자', me);
      if (showStatus(meSection, me)) {
        addText(meSection, `이름: ${me.data.user.label}`);
        addText(meSection, `사용자 ID: ${me.data.user.id}`);
      }

      const deviceSection = addSection('현재 기기', devices);
      if (showStatus(deviceSection, devices)) {
        if (me?.status !== 'ok' || !me.data?.device) {
          addText(deviceSection, '현재 로그인 정보를 확인할 수 없어 기기를 표시하지 않습니다.');
        } else {
          const currentDevice = devices.data.find((item) => item.id === me.data.device.id) || me.data.device;
          const deviceStatus = statusLabels.device[currentDevice.status] || statusLabels.device.unknown;
          addText(deviceSection, `기기 이름: ${currentDevice.label}`);
          addText(deviceSection, `기기 ID: ${currentDevice.id}`);
          addText(deviceSection, `보안 상태: ${deviceStatus}`);
        }
      }

      const sessionSection = addSection('로그인 세션', sessions);
      if (showStatus(sessionSection, sessions)) {
        if (me?.status !== 'ok' || !me.data?.session) {
          addText(sessionSection, '현재 로그인 정보를 확인할 수 없어 세션을 표시하지 않습니다.');
        } else {
          const currentSession = sessions.data.find((item) => item.id === me.data.session.id) || me.data.session;
          const sessionStatus = statusLabels.session[currentSession.status] || statusLabels.session.unknown;
          addText(sessionSection, `세션 ID: ${currentSession.id}`);
          addText(sessionSection, `세션 상태: ${sessionStatus}`);
        }
      }

      return root;
    },
    renderDecision({ status, mode, data, error, appId } = {}) {
      const root = document.createElement('section');
      const modeLabels = {
        connected: '연결됨(connected)',
        demo: '예제 자료(demo) · 실제 접속 판정 아님',
        disconnected: '연결 없음(disconnected)',
        unknown: '확인 불가(unknown)',
      };
      const addText = (text) => {
        const line = document.createElement('p');
        line.textContent = text;
        root.append(line);
      };
      const modeLabel = modeLabels[mode] || modeLabels.unknown;
      addText(modeLabel);

      if (status === 'idle') {
        addText('업무 앱을 골라 접속을 요청하세요.');
      } else if (status === 'loading') {
        addText('접속 판정을 확인하는 중입니다.');
      } else if (status === 'error') {
        const message = typeof error?.message === 'string' && error.message.length > 0
          ? error.message
          : '오류 메시지가 제공되지 않았습니다.';
        addText(`요청 실패: ${message}`);
        addText('이 실패는 거부 판정이 아닙니다.');
      } else if (status === 'ok' && data) {
        const decisions = {
          allow: '허용(allow)',
          deny: '거부(deny)',
          challenge: '추가 확인 필요(challenge)',
          unknown: '확인 불가(unknown)',
        };
        const rawDecision = typeof data.decision === 'string' ? data.decision : String(data.decision ?? '없음');
        const isKnownDecision = Object.hasOwn(decisions, rawDecision);
        // 허용 목록에 없는 값은 원문과 무관하게 고정된 unknown 판정으로 표시합니다.
        const decisionLabel = isKnownDecision ? decisions[rawDecision] : '확인 불가(unknown)';
        addText(`업무 앱 ID: ${data.appId ?? appId ?? '확인 불가'}`);
        addText(`접속 판정: ${decisionLabel}`);
        addText(`판정 이유: ${typeof data.reason === 'string' ? data.reason : '제공되지 않았습니다.'}`);
        addText(`확인 시각: ${typeof data.checkedAt === 'string' ? data.checkedAt : '제공되지 않았습니다.'}`);
        if (rawDecision === 'challenge') {
          addText('추가 확인(challenge) 판정입니다. 별도의 확인 절차를 진행해야 합니다.');
          addText('이 화면은 필요한 확인 절차를 대신 수행하거나 완료 여부를 보증하지 않습니다.');
        }
        if (rawDecision === 'unknown' || !isKnownDecision) {
          addText('판정 확인 불가(unknown): 접근 허용으로 간주하지 마세요.');
        }
        if (!isKnownDecision) {
          addText(`참고: 서버가 반환한 원본 판정 값: ${rawDecision}`);
        }
      } else {
        addText('접속 판정 상태를 확인할 수 없습니다. 허용으로 간주하지 마세요.');
      }

      return root;
    },
    renderEvents({ status, mode, data, error } = {}) {
      const root = document.createElement('section');
      const modeLabels = {
        demo: '예제 자료(demo) · 실제 보안 기록 아님',
        disconnected: '연결 없음(disconnected)',
        unknown: '확인 불가(unknown)',
      };
      const addText = (parent, text) => {
        const line = document.createElement('p');
        line.textContent = text;
        parent.append(line);
      };
      const modeLabel = modeLabels[mode];
      if (modeLabel) addText(root, modeLabel);

      if (status === 'loading') {
        addText(root, '보안 기록을 불러오는 중입니다.');
        return root;
      }
      if (status === 'error') {
        const message = typeof error?.message === 'string' && error.message.length > 0
          ? error.message
          : '오류 메시지가 제공되지 않았습니다.';
        const unverified = ['CONTRACT_MISMATCH', 'ENGINE_RESULT_UNVERIFIED'].includes(error?.code);
        addText(root, `${unverified ? '확인 불가' : '기록을 불러오지 못했습니다'}: ${message}`);
        return root;
      }
      if (status !== 'ok' || !Array.isArray(data)) {
        addText(root, '보안 기록을 확인할 수 없습니다.');
        return root;
      }

      const kindLabels = { access: '접속 기록', xdr: 'XDR 경보' };
      const stateLabels = {
        access: { allowed: '접근 허용', denied: '접근 거부', unknown: '확인 불가' },
        session: { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' },
        device: { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' },
      };
      const filters = document.createElement('div');
      const createFilter = (key, labelText, values, labelForValue) => {
        const label = document.createElement('label');
        const select = document.createElement('select');
        const id = `student-event-filter-${key}`;
        label.setAttribute('for', id);
        label.textContent = labelText;
        select.id = id;
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = '전체';
        select.append(allOption);
        for (const value of values) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = labelForValue(value);
          select.append(option);
        }
        filters.append(label, select);
        return select;
      };

      const kinds = [...new Set(data.map((event) => event.kind).filter((kind) => typeof kind === 'string'))];
      const appIds = [...new Set(data.map((event) => event.appId).filter((id) => typeof id === 'string' && id.length > 0))];
      const accessStates = [...new Set(data.map((event) => event.state?.access).filter((value) => typeof value === 'string'))];
      const kindFilter = createFilter('kind', '기록 종류', kinds, (value) => `${kindLabels[value] || '기록'}(${value})`);
      const appFilter = createFilter('app', '업무 앱', appIds, (value) => value);
      const accessFilter = createFilter('access', '접속 상태', accessStates, (value) => `${stateLabels.access[value] || '확인 불가'}(${value})`);
      root.append(filters);

      // 정렬은 복사본에만 적용해 전달받은 배열과 서버 데이터를 변경하지 않습니다.
      const ordered = data.slice().sort((left, right) => Date.parse(right.at) - Date.parse(left.at));
      const rawState = (kind, value) => {
        const raw = typeof value === 'string' ? value : 'unknown';
        return `${stateLabels[kind]?.[raw] || '확인 불가'}(${raw})`;
      };
      const rows = [];
      const noMatches = document.createElement('p');
      noMatches.textContent = '선택한 조건에 맞는 기록이 없습니다.';
      noMatches.hidden = true;

      if (ordered.length === 0) {
        addText(list, '표시할 기록이 없습니다.');
      } else {
        // 행과 상세 DOM은 한 번만 만듭니다. 필터 변경 때 목록을 비웠다 다시 만들지 않고
        // 행의 hidden 상태만 바꿔 깜박임과 열린 상세의 불필요한 초기화를 막습니다.
        ordered.forEach((event, index) => {
          const row = document.createElement('article');
          row.setAttribute('data-student-event-id', event.id);
          addText(row, `사건 ID: ${event.id}`);
          addText(row, `시각: ${event.at}`);
          addText(row, `종류: ${kindLabels[event.kind] || '확인 불가'}(${event.kind})`);
          addText(row, `업무 앱: ${event.appId || '앱을 확인할 수 없습니다(appId 없음)'}`);
          addText(row, `요약: ${event.summary}`);

          const detail = document.createElement('section');
          detail.id = `student-event-detail-${index}`;
          detail.hidden = true;
          detail.setAttribute('data-student-event-detail', event.id);
          addText(detail, `사건 ID: ${event.id}`);
          addText(detail, `업무 앱: ${event.appId || '앱을 확인할 수 없습니다(appId 없음)'}`);
          addText(detail, `접속 상태: ${rawState('access', event.state?.access)}`);
          addText(detail, `세션 상태: ${rawState('session', event.state?.session)}`);
          addText(detail, `기기 상태: ${rawState('device', event.state?.device)}`);
          addText(detail, '근거');
          if (Array.isArray(event.evidence) && event.evidence.length > 0) {
            for (const evidence of event.evidence) addText(detail, `${evidence.id} — ${evidence.text}`);
          } else {
            addText(detail, '근거 없음');
          }
          addText(detail, '규칙');
          if (Array.isArray(event.rules) && event.rules.length > 0) {
            for (const rule of event.rules) addText(detail, `${rule.id} — ${rule.text}`);
          } else {
            addText(detail, '규칙 없음');
          }

          // supportedActions가 있는 경우에만 조치 안내를 노출하며, 실행·요청 기능은 만들지 않습니다.
          if (Array.isArray(event.supportedActions) && event.supportedActions.length > 0) {
            addText(detail, '미지원 조치');
            for (const action of event.supportedActions) {
              if (typeof action !== 'string' || action.length === 0) continue;
              const unsupportedButton = document.createElement('button');
              unsupportedButton.type = 'button';
              unsupportedButton.textContent = `${action} 미지원`;
              unsupportedButton.disabled = true;
              detail.append(unsupportedButton);
              addText(detail, '아직 지원하지 않는 조치입니다. 조치 실행 연결은 준비 중이며 요청을 전송하지 않았습니다.');
            }
          }

          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = '상세 보기';
          button.setAttribute('aria-label', `${event.id} 상세`);
          button.setAttribute('aria-expanded', 'false');
          button.setAttribute('aria-controls', detail.id);
          button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') === 'true';
            for (const otherButton of list.querySelectorAll('button[aria-expanded="true"]')) {
              if (otherButton !== button) {
                otherButton.setAttribute('aria-expanded', 'false');
                otherButton.textContent = '상세 보기';
                const otherDetail = document.getElementById(otherButton.getAttribute('aria-controls'));
                if (otherDetail) otherDetail.hidden = true;
              }
            }
            button.setAttribute('aria-expanded', String(!expanded));
            button.textContent = expanded ? '상세 보기' : '상세 닫기';
            detail.hidden = expanded;
          });
          row.append(button, detail);
          list.append(row);
          rows.push({ event, row });
        });
        list.append(noMatches);
      }

      const renderRows = () => {
        if (ordered.length === 0) return;
        let visibleCount = 0;
        for (const { event, row } of rows) {
          const matches = (kindFilter.value === 'all' || event.kind === kindFilter.value)
            && (appFilter.value === 'all' || event.appId === appFilter.value)
            && (accessFilter.value === 'all' || event.state?.access === accessFilter.value);
          row.hidden = !matches;
          if (matches) visibleCount += 1;
        }
        noMatches.hidden = visibleCount !== 0;
      };

      kindFilter.addEventListener('change', renderRows);
      appFilter.addEventListener('change', renderRows);
      accessFilter.addEventListener('change', renderRows);
      root.append(list);
      renderRows();
      return root;
    },
    renderStatus({ devices, sessions, notifications, diagnostics, mode } = {}) {
      const root = document.createElement('section');
      const addText = (parent, text, tag = 'p') => {
        const line = document.createElement(tag);
        line.textContent = text;
        parent.append(line);
        return line;
      };
      const addSection = (title, resource) => {
        const section = document.createElement('section');
        const heading = document.createElement('h3');
        heading.textContent = title;
        section.append(heading);
        const resourceMode = resource?.mode || mode;
        const modeLabels = {
          connected: '연결됨(connected)',
          demo: '예제 자료(demo) · 실제 연결 아님',
          disconnected: '연결 없음(disconnected)',
          unknown: '연결 상태 확인 불가(unknown)',
        };
        if (modeLabels[resourceMode]) addText(section, modeLabels[resourceMode]);
        root.append(section);
        return section;
      };
      const heading = document.createElement('h2');
      heading.textContent = '기기·세션 상태 및 도움정보';
      root.append(heading);

      const deviceSection = addSection('등록 기기', devices);
      const sessionSection = addSection('현재 세션', sessions);
      const statusLabels = {
        device: { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' },
        session: { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' },
      };
      const renderCollection = (section, resource, resourceName, emptyMessage, renderItem) => {
        if (resource?.status === 'loading') {
          addText(section, `${resourceName}을 불러오는 중입니다.`);
          return;
        }
        if (resource?.status === 'error') {
          const error = resource.error || {};
          const message = typeof error.message === 'string' && error.message.length > 0
            ? error.message
            : '오류 메시지가 제공되지 않았습니다.';
          const timeout = ['TIMEOUT', 'REQUEST_TIMEOUT', 'ENGINE_TIMEOUT'].includes(error.code);
          addText(section, `${resourceName}${timeout ? ' 조회 시간이 초과됐습니다' : '을 불러오지 못했습니다'}: ${message}`);
          addText(section, '다시 시도하려면 위쪽 「다시 불러오기」 버튼을 직접 누르세요. 자동으로 다시 요청하지 않습니다.');
          return;
        }
        if (resource?.status !== 'ok' || !Array.isArray(resource.data)) {
          addText(section, `${resourceName} 상태를 확인할 수 없습니다. 응답 형식을 확인할 수 없습니다.`);
          return;
        }
        if (resource.data.length === 0) {
          addText(section, emptyMessage);
          return;
        }
        const list = document.createElement('ul');
        for (const item of resource.data) {
          const row = document.createElement('li');
          renderItem(row, item);
          list.append(row);
        }
        section.append(list);
      };
      renderCollection(deviceSection, devices, '등록 기기 목록', '등록된 기기가 없습니다.', (row, device) => {
        addText(row, `기기 이름: ${typeof device?.label === 'string' ? device.label : '확인 불가'}`);
        addText(row, `기기 ID: ${typeof device?.id === 'string' ? device.id : '확인 불가'}`);
        const status = typeof device?.status === 'string' ? device.status : 'unknown';
        addText(row, `기기 상태: ${statusLabels.device[status] || '확인 불가'}(${status})`);
      });
      renderCollection(sessionSection, sessions, '세션 목록', '현재 연결이 없습니다.', (row, session) => {
        addText(row, `세션 ID: ${typeof session?.id === 'string' ? session.id : '확인 불가'}`);
        const status = typeof session?.status === 'string' ? session.status : 'unknown';
        addText(row, `세션 상태: ${statusLabels.session[status] || '확인 불가'}(${status})`);
      });
      addText(sessionSection, '세션 조회는 현재 검증된 연결 한 개를 대상으로 합니다. 과거 세션 전체 목록이 아닙니다.');

      const notificationSection = addSection('알림', { mode });
      if (!Array.isArray(notifications)) {
        addText(notificationSection, '알림 정보를 확인할 수 없습니다.');
      } else if (notifications.length === 0) {
        addText(notificationSection, '주의할 알림이 없습니다.');
      } else {
        const notificationList = document.createElement('ul');
        for (const notification of notifications) {
          const item = document.createElement('li');
          addText(item, `자료(resource): ${typeof notification?.resource === 'string' ? notification.resource : '확인 불가'}`);
          const code = typeof notification?.code === 'string' && /^[A-Za-z0-9._:-]{1,100}$/.test(notification.code)
            ? notification.code
            : '확인 불가';
          addText(item, `코드(code): ${code}`);
          addText(item, `메시지(message): ${typeof notification?.message === 'string' ? notification.message : '메시지가 제공되지 않았습니다.'}`);
          notificationList.append(item);
        }
        notificationSection.append(notificationList);
      }

      const diagnosticsSection = addSection('진단 정보', diagnostics);
      let copyStatus;
      const safeDiagnostic = (resource) => {
        const data = resource?.data;
        const engine = data?.engine;
        const isUuid = (value) => typeof value === 'string'
          && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
        const isTime = (value) => typeof value === 'string'
          && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/.test(value)
          && Number.isFinite(Date.parse(value));
        const isVersion = (value) => typeof value === 'string' && /^\d+\.\d+\.\d+$/.test(value);
        const engineCodes = ['ENGINE_NOT_CONNECTED', 'DEMO_ONLY', 'ADAPTER_CONFIGURED'];
        if (!isUuid(data?.requestId) || data?.component !== 'on-client' || !isVersion(data?.version)
          || !isTime(data?.checkedAt) || !['connected', 'demo', 'disconnected'].includes(engine?.mode)
          || !engineCodes.includes(engine?.code)) return null;
        // 비밀이 아닌 계약상 허용 필드만 골라낸다. diagnostics.data의 다른 필드는 표시·복사하지 않는다.
        return {
          requestId: data.requestId,
          component: data.component,
          version: data.version,
          checkedAt: data.checkedAt,
          engine: { mode: engine.mode, code: engine.code },
        };
      };
      if (diagnostics?.status === 'loading') {
        addText(diagnosticsSection, '도움정보를 불러오는 중입니다.');
      } else if (diagnostics?.status === 'error') {
        const message = typeof diagnostics.error?.message === 'string' && diagnostics.error.message.length > 0
          ? diagnostics.error.message
          : '오류 메시지가 제공되지 않았습니다.';
        addText(diagnosticsSection, `도움정보를 불러오지 못했습니다: ${message}`);
        addText(diagnosticsSection, '다시 확인하려면 제공 화면의 「도움정보 불러오기」를 직접 누르세요. 자동으로 다시 요청하지 않습니다.');
      } else if (diagnostics?.status === 'ok') {
        const safe = safeDiagnostic(diagnostics);
        if (!safe) {
          addText(diagnosticsSection, '진단 결과 형식을 확인할 수 없습니다.');
        } else {
          const fields = [
            ['requestId', safe.requestId],
            ['component', safe.component],
            ['version', safe.version],
            ['checkedAt', safe.checkedAt],
            ['engine.mode', safe.engine.mode],
            ['engine.code', safe.engine.code],
          ];
          const details = document.createElement('dl');
          for (const [name, value] of fields) {
            const term = document.createElement('dt');
            term.textContent = name;
            const description = document.createElement('dd');
            description.textContent = value;
            details.append(term, description);
          }
          diagnosticsSection.append(details);
          addText(diagnosticsSection, '이 비밀 없는 도움정보는 지원 요청에 사용할 수 있습니다. 비밀번호·토큰·API 키는 포함하지 않습니다.');
          const copyButton = document.createElement('button');
          copyButton.type = 'button';
          copyButton.textContent = '도움정보 복사';
          copyStatus = document.createElement('p');
          copyStatus.setAttribute('role', 'status');
          copyButton.addEventListener('click', async () => {
            try {
              const clipboard = globalThis.navigator?.clipboard;
              if (!clipboard || typeof clipboard.writeText !== 'function') throw new Error('clipboard unavailable');
              await clipboard.writeText(JSON.stringify(safe, null, 2));
              copyStatus.textContent = '허용된 진단 항목을 클립보드에 복사했습니다. 보내기 전에 내용을 확인하세요.';
            } catch {
              copyStatus.textContent = '자동 복사를 사용할 수 없습니다. 도움정보를 화면에서 직접 확인하세요.';
            }
          });
          diagnosticsSection.append(copyButton, copyStatus);
        }
      } else {
        addText(diagnosticsSection, '도움정보는 아직 조회되지 않았습니다.');
      }

      return root;
    },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection({ status, mode, data, error, checkedAt, explanationAccepted } = {}) {
      const root = document.createElement('section');
      const heading = document.createElement('h2');
      heading.textContent = 'AI 연결 점검';
      root.append(heading);
      const addText = (text, tag = 'p') => {
        const line = document.createElement(tag);
        line.textContent = text;
        root.append(line);
        return line;
      };
      const safeCodeDetails = {
        ON_AI_PROVISIONING_PENDING: ['권한 준비 중 또는 확인 불가', '담당자에게 계정 연결과 앱 권한 준비 상태를 확인해 달라고 요청하세요.'],
        WB_CLCO_AUTH_REQUIRED: ['인증 실패', '계정 연결 상태를 다시 확인하고, 계속되면 담당자에게 확인을 요청하세요.'],
        WB_CLCO_ACCESS_BLOCKED: ['접근 제한', '계정 연결과 앱 권한을 담당자에게 확인해 달라고 요청하세요.'],
        WB_CLCO_COHORT_BUDGET_EXHAUSTED: ['반 사용량 한도', '담당자에게 반 사용량과 한도를 확인해 달라고 요청하세요.'],
        WB_CLCO_LIMIT_REACHED: ['이용 한도', '담당자에게 이용 한도를 확인해 달라고 요청하세요.'],
        WB_CLCO_RATE_LIMITED: ['요청 제한', '자동 재시도하지 않습니다. 잠시 뒤 「현재 API 연결 점검」을 직접 다시 누르세요.'],
        WB_CLCO_SESSION_CLOSED: ['이용 시간이 아님', '이용 가능 시간을 확인하세요.'],
        WB_CLCO_TIMEOUT: ['시간 초과', '자동 재시도하지 않습니다. 잠시 뒤 직접 다시 점검하세요.'],
        REQUEST_TIMEOUT: ['시간 초과', '자동 재시도하지 않습니다. 잠시 뒤 직접 다시 점검하세요.'],
        ENGINE_TIMEOUT: ['시간 초과', '자동 재시도하지 않습니다. 잠시 뒤 직접 다시 점검하세요.'],
        TIMEOUT: ['시간 초과', '자동 재시도하지 않습니다. 잠시 뒤 직접 다시 점검하세요.'],
        WB_CLCO_NETWORK_ERROR: ['네트워크 오류', '연결 상태를 확인하고 잠시 뒤 직접 다시 점검하세요.'],
        NETWORK_ERROR: ['네트워크 오류', '연결 상태를 확인하고 잠시 뒤 직접 다시 점검하세요.'],
        WB_CLCO_SERVER_UNAVAILABLE: ['AI 서버 연결 실패', '잠시 뒤 직접 다시 점검하세요. 자동 재시도는 하지 않습니다.'],
        WB_CLCO_CANCELLED: ['취소됨', '취소된 점검 결과는 현재 결과가 아닙니다. 필요하면 점검 버튼을 직접 누르세요.'],
        CANCELLED: ['취소됨', '취소된 점검 결과는 현재 결과가 아닙니다. 필요하면 점검 버튼을 직접 누르세요.'],
        REQUEST_CANCELLED: ['취소됨', '취소된 점검 결과는 현재 결과가 아닙니다. 필요하면 점검 버튼을 직접 누르세요.'],
        ON_AI_MODEL_LIST_EMPTY: ['사용 가능한 모델 없음', '담당자에게 앱에서 허용된 모델 설정을 확인해 달라고 요청하세요.'],
        MODEL_NOT_CONFIGURED: ['모델 없음 또는 설정되지 않음', '담당자에게 사용할 수 있는 모델과 허용 설정을 확인해 달라고 요청하세요.'],
        ON_AI_AUTHORIZATION_CHANGED: ['권한 변경 확인 필요', '담당자에게 현재 앱 권한을 확인해 달라고 요청한 뒤 직접 다시 점검하세요.'],
        ON_AI_TRANSPORT_PENDING: ['연결 모듈 준비 중', '담당자에게 수업용 AI 연결 모듈의 준비 상태를 확인해 달라고 요청하세요.'],
        WB_CLCO_REQUEST_FAILED: ['요청 실패', '오류 원인을 확인할 수 없습니다. 담당자에게 도움을 요청하세요.'],
        WB_CLCO_INVALID_RESPONSE: ['응답 형식 확인 불가', '담당자에게 수업용 AI 연결 응답 형식을 확인해 달라고 요청하세요.'],
        WB_CLCO_INVALID_CONTENT_TYPE: ['응답 형식 확인 불가', '담당자에게 수업용 AI 연결 응답 형식을 확인해 달라고 요청하세요.'],
        WB_CLCO_RESPONSE_TOO_LARGE: ['응답 형식 확인 불가', '담당자에게 수업용 AI 연결 응답 크기를 확인해 달라고 요청하세요.'],
        WB_CLCO_REDIRECT_BLOCKED: ['연결 경로 확인 불가', '담당자에게 앱 서버의 수업용 AI 연결 경로를 확인해 달라고 요청하세요.'],
        WB_CLCO_INVALID_URL: ['연결 설정 확인 필요', '담당자에게 앱 서버의 연결 설정을 확인해 달라고 요청하세요.'],
        WB_CLCO_INVALID_TOKEN: ['앱 인증 설정 확인 필요', '학생이 열쇠를 복사하거나 입력하지 말고 담당자에게 서버 측 앱 인증 설정을 확인해 달라고 요청하세요.'],
        WB_CLCO_INVALID_LIMIT: ['연결 제한 설정 확인 필요', '담당자에게 앱 서버의 연결 제한 설정을 확인해 달라고 요청하세요.'],
        ON_AI_INVALID_INPUT: ['요청 입력 확인 불가', '보안 이벤트가 아닌 연결 점검 입력에서 문제가 발생했습니다. 담당자에게 확인을 요청하세요.'],
        ON_AI_INVALID_OUTPUT: ['응답 확인 불가', '담당자에게 수업용 AI의 점검 응답 형식을 확인해 달라고 요청하세요.'],
        AI_REQUEST_UNVERIFIED: ['연결 확인 불가', '기존 판정과 기록은 그대로입니다. 도움정보를 확인하거나 담당자에게 문의하세요.'],
      };
      const isSafeMessage = (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= 500
        && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
        && !/(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i.test(value);

      if (status === 'idle') {
        addText('AI 연결 점검 전입니다.');
        addText('계정 연결과 AI 앱 승인을 마친 뒤 「현재 API 연결 점검」을 직접 눌러 점검하세요. 자동 점검이나 자동 재시도는 하지 않습니다.');
        return root;
      }
      if (status === 'loading') {
        addText('AI 연결 점검 중입니다.');
        addText('점검은 사용자가 직접 시작합니다. 자동 재시도는 하지 않습니다.');
        return root;
      }
      if (status === 'error') {
        const code = typeof error?.code === 'string' && Object.hasOwn(safeCodeDetails, error.code)
          ? error.code
          : 'AI_REQUEST_UNVERIFIED';
        const [category, guidance] = safeCodeDetails[code];
        const message = isSafeMessage(error?.message) ? error.message : guidance;
        addText(`AI 연결 점검 실패: ${category}`);
        addText(`오류 코드: ${code}`);
        addText(`오류 메시지: ${message}`);
        addText(`안내: ${guidance}`);
        if (code === 'CANCELLED' || code === 'REQUEST_CANCELLED' || code === 'WB_CLCO_CANCELLED') {
          addText('취소되기 전의 결과는 현재 점검 결과로 표시하지 않습니다.');
        }
        return root;
      }
      if (status !== 'ok' || !data || data.transportChecked !== true
        || !['test', 'verified'].includes(data.audienceAuthorization)
        || !Number.isInteger(data.modelCount) || data.modelCount < 0 || data.modelCount > 10000
        || typeof checkedAt !== 'string' || checkedAt.length > 100 || !Number.isFinite(Date.parse(checkedAt))) {
        addText('AI 연결 점검 결과를 확인할 수 없습니다. 연결 성공으로 간주하지 마세요.');
        return root;
      }

      addText(data.audienceAuthorization === 'test'
        ? '시험 연결 점검(test) · 실제 앱 권한 확인이 아닙니다.'
        : '앱 권한 확인 후 점검(verified) · 이 확인 시각 기준의 결과입니다.');
      if (mode === 'demo') addText('예제 자료(demo)입니다. 실제 계정의 운영 연결을 확인한 결과가 아닙니다.');
      const details = document.createElement('dl');
      for (const [name, value] of [
        ['모델 수(modelCount)', String(data.modelCount)],
        ['점검 시각(checkedAt)', checkedAt],
      ]) {
        const term = document.createElement('dt');
        term.textContent = name;
        const description = document.createElement('dd');
        description.textContent = value;
        details.append(term, description);
      }
      root.append(details);
      addText('이 화면은 AI 연결과 모델 목록만 점검했습니다. 사건 설명은 실행하지 않았습니다. 보안 기록에서 별도로 사건 설명을 요청하고 그 결과를 확인하세요.');
      // explanationAccepted는 사건 설명 결과를 이 연결 점검 결과로 대체하는 근거가 아닙니다.
      if (explanationAccepted === true) addText('사건 설명 결과는 이 점검 화면이 아니라 해당 보안 기록의 별도 설명 결과에서 확인하세요.');
      return root;
    },
    renderExplanation({ event, explanation, checkedAt } = {}) {
      const root = document.createElement('section');
      const heading = document.createElement('h2');
      heading.textContent = '보안 이벤트 설명';
      root.append(heading);
      const addText = (text) => {
        const line = document.createElement('p');
        line.textContent = text;
        root.append(line);
      };
      const safeCodes = new Set([
        'ON_AI_PROVISIONING_PENDING', 'WB_CLCO_AUTH_REQUIRED', 'WB_CLCO_ACCESS_BLOCKED',
        'WB_CLCO_COHORT_BUDGET_EXHAUSTED', 'WB_CLCO_LIMIT_REACHED', 'WB_CLCO_RATE_LIMITED',
        'WB_CLCO_SESSION_CLOSED', 'WB_CLCO_TIMEOUT', 'REQUEST_TIMEOUT', 'ENGINE_TIMEOUT', 'TIMEOUT',
        'WB_CLCO_NETWORK_ERROR', 'NETWORK_ERROR', 'WB_CLCO_SERVER_UNAVAILABLE',
        'WB_CLCO_CANCELLED', 'CANCELLED', 'REQUEST_CANCELLED', 'MODEL_NOT_CONFIGURED',
        'ON_AI_MODEL_LIST_EMPTY', 'ON_AI_AUTHORIZATION_CHANGED', 'ON_AI_INVALID_INPUT',
        'ON_AI_INVALID_OUTPUT', 'ON_AI_TRANSPORT_PENDING', 'WB_CLCO_INVALID_URL',
        'WB_CLCO_INVALID_TOKEN', 'WB_CLCO_INVALID_LIMIT', 'WB_CLCO_INVALID_RESPONSE',
        'WB_CLCO_INVALID_CONTENT_TYPE', 'WB_CLCO_RESPONSE_TOO_LARGE', 'WB_CLCO_REDIRECT_BLOCKED',
        'WB_CLCO_REQUEST_FAILED', 'AI_REQUEST_UNVERIFIED', 'CONTRACT_MISMATCH',
      ]);
      const safeMessage = (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= 1500
        && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
        && !/(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i.test(value);
      const safeId = (value) => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(value);
      const safeCode = (value) => typeof value === 'string' && safeCodes.has(value);
      const errorCode = safeCode(explanation?.error?.code) ? explanation.error.code : 'AI_REQUEST_UNVERIFIED';
      const errorMessage = safeMessage(explanation?.error?.message)
        ? explanation.error.message
        : '오류 메시지를 안전하게 표시할 수 없습니다.';
      const failureReason = {
        ON_AI_INVALID_INPUT: '사건의 근거 또는 규칙이 부족하거나 안전하게 확인되지 않아 설명할 수 없습니다.',
        ON_AI_INVALID_OUTPUT: 'AI 응답의 근거 연결 또는 출력 형식을 확인할 수 없어 설명을 사용할 수 없습니다.',
        ON_AI_PROVISIONING_PENDING: 'AI 설명 연결이 준비되지 않았거나 확인되지 않았습니다.',
      };
      const rejectExplanation = (reason) => {
        addText(`AI 설명을 사용할 수 없습니다: ${reason}`);
        addText('설명 내용을 사실처럼 표시하지 않았습니다. 보안 기록은 그대로입니다.');
      };

      // 오류는 event 유무와 무관하게 먼저 표시합니다. 실패한 설명은 기록 상세를 대체하지 않습니다.
      if (explanation?.status === 'error') {
        addText('AI 설명 실패');
        addText(`오류 코드: ${errorCode}`);
        addText(`오류 메시지: ${errorMessage}`);
        addText(`실패 이유: ${failureReason[errorCode] || 'AI 설명을 확인할 수 없어 사용할 수 없습니다.'}`);
        addText('기록은 그대로입니다. AI 설명이나 제안으로 보안 조치가 실행되지는 않았습니다.');
        return root;
      }

      if (!event) {
        addText('보안 기록에서 기록을 먼저 고르세요.');
        return root;
      }
      if (explanation?.status === 'idle' || !explanation?.status) {
        addText('선택한 기록의 AI 설명은 아직 요청되지 않았습니다.');
        return root;
      }
      if (explanation.status === 'loading') {
        addText(`선택한 기록(${safeId(event.id) ? event.id : 'ID 확인 불가'})의 AI 설명을 요청 중입니다.`);
        return root;
      }
      if (explanation.status !== 'ok') {
        addText('AI 설명 상태를 확인할 수 없습니다. 보안 기록은 그대로입니다.');
        return root;
      }
      if (!safeId(event.id)) {
        rejectExplanation('선택한 기록의 ID를 확인할 수 없습니다.');
        return root;
      }

      const data = explanation.data;
      if (!data || !safeMessage(data.summary)) {
        rejectExplanation('AI 요약이 없거나 안전한 문장으로 확인되지 않았습니다.');
        return root;
      }
      if (data.executed === true) {
        rejectExplanation('AI 응답이 조치가 이미 실행됐다고 표시했습니다. 실행 여부를 확인할 수 없어 이 설명은 사용할 수 없습니다.');
        return root;
      }
      if (data.executed !== false || data.requiresHumanConfirmation !== true) {
        rejectExplanation('사람 확인이 필요하고 조치가 실행되지 않았다는 응답을 확인할 수 없습니다.');
        return root;
      }
      if (!Array.isArray(event.evidence) || !Array.isArray(data.evidenceIds) || data.evidenceIds.length === 0) {
        rejectExplanation('현재 기록에 연결된 근거가 없거나 인용된 근거 ID를 확인할 수 없습니다.');
        return root;
      }
      if (!Array.isArray(event.rules)) {
        rejectExplanation('선택한 기록의 규칙 정보를 확인할 수 없습니다.');
        return root;
      }
      if (!Array.isArray(data.proposals)) {
        rejectExplanation('제안 데이터의 형식을 확인할 수 없습니다.');
        return root;
      }

      const resolveEvidence = (ids) => {
        if (!Array.isArray(ids) || ids.length === 0 || ids.some((id) => !safeId(id)) || new Set(ids).size !== ids.length) return null;
        const resolved = [];
        for (const id of ids) {
          const evidence = event.evidence.find((item) => item && item.id === id);
          if (!evidence || !safeMessage(evidence.text)) return null;
          resolved.push({ id, text: evidence.text });
        }
        return resolved;
      };
      const citedEvidence = resolveEvidence(data.evidenceIds);
      if (!citedEvidence) {
        const missingId = Array.isArray(data.evidenceIds)
          ? data.evidenceIds.find((id) => safeId(id) && !event.evidence.some((item) => item && item.id === id))
          : null;
        rejectExplanation(missingId
          ? `근거 ID ${missingId}를 현재 기록에서 찾을 수 없습니다(근거 불일치).`
          : '인용된 근거 ID가 현재 기록과 일치하지 않습니다(근거 불일치).');
        return root;
      }

      const supportedActions = Array.isArray(event.supportedActions) ? event.supportedActions : [];
      const proposals = [];
      for (const proposal of data.proposals) {
        if (!proposal || !safeId(proposal.action) || !safeMessage(proposal.reason)
          || !supportedActions.includes(proposal.action)) {
          rejectExplanation('제안된 조치를 현재 연동 시스템의 지원 항목과 확인할 수 없습니다.');
          return root;
        }
        const proposalEvidence = resolveEvidence(proposal.evidenceIds);
        if (!proposalEvidence) {
          rejectExplanation('제안의 근거 ID가 현재 기록과 일치하지 않습니다(근거 불일치).');
          return root;
        }
        proposals.push({ ...proposal, evidence: proposalEvidence });
      }

      const stateLabels = {
        access: { allowed: '접근 허용(allowed)', denied: '접근 거부(denied)', unknown: '확인 불가(unknown)' },
        session: { active: '활성(active)', expired: '만료(expired)', revoked: '철회됨(revoked)', unknown: '확인 불가(unknown)' },
        device: { compliant: '보안 기준 충족(compliant)', noncompliant: '보안 기준 미충족(noncompliant)', unknown: '확인 불가(unknown)' },
      };
      const stateNames = { access: '접속', session: '세션', device: '기기' };
      const currentStates = ['access', 'session', 'device'].map((key) => {
        const value = event.state?.[key];
        const raw = typeof value === 'string' ? value : 'unknown';
        const label = stateLabels[key][raw] || `확인 불가(${raw})`;
        return { key, raw, line: `${stateNames[key]} 상태: ${label}` };
      });
      const unknownStates = currentStates.filter((item) => item.raw === 'unknown' || !Object.hasOwn(stateLabels[item.key], item.raw));

      // 이 지점까지 모든 필드와 근거가 선택한 event에 결합됐을 때만 성공 표시를 붙입니다.
      root.setAttribute('data-student-explanation-event', event.id);
      addText(`사건 ID: ${event.id}`);
      addText('AI 설명(참고용)');
      addText(data.summary);
      if (typeof checkedAt === 'string' && safeMessage(checkedAt)) addText(`설명 확인 시각: ${checkedAt}`);

      addText('인용한 근거');
      for (const evidence of citedEvidence) addText(`${evidence.id} — ${evidence.text}`);
      addText('규칙');
      if (event.rules.length === 0) {
        addText('규칙 정보가 없습니다.');
      } else {
        for (const rule of event.rules) {
          const id = safeId(rule?.id) ? rule.id : 'ID 확인 불가';
          const text = safeMessage(rule?.text) ? rule.text : '규칙 문장을 확인할 수 없습니다.';
          addText(`${id} — ${text}`);
        }
      }

      addText('이벤트 현재 상태');
      for (const state of currentStates) addText(state.line);
      addText('확인 불가 상태');
      if (unknownStates.length === 0) {
        addText('없음');
      } else {
        for (const state of unknownStates) addText(`${stateNames[state.key]}: 확인 불가(${state.raw})`);
      }

      addText('제안');
      if (proposals.length === 0) {
        if (supportedActions.length === 0) {
          addText('연동 시스템이 지원하는 조치가 없어 제안이 없습니다(정상).');
        } else {
          addText('AI가 제안한 조치가 없습니다.');
        }
      } else {
        for (const proposal of proposals) {
          addText(`조치: ${proposal.action}`);
          addText(`이유: ${proposal.reason}`);
          addText(`제안 근거 ID: ${proposal.evidence.map((item) => item.id).join(', ')}`);
          addText('사람 확인이 필요하며 아직 실행되지 않았습니다. 이 화면은 조치를 실행하지 않습니다.');
        }
      }
      return root;
    },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
