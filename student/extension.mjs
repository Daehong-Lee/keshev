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
      const list = document.createElement('div');
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
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
