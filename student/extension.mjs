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
        const decisionLabel = decisions[rawDecision] || `확인 불가(${rawDecision})`;
        addText(`업무 앱 ID: ${data.appId ?? appId ?? '확인 불가'}`);
        addText(`접속 판정: ${decisionLabel}`);
        addText(`판정 이유: ${typeof data.reason === 'string' ? data.reason : '제공되지 않았습니다.'}`);
        addText(`확인 시각: ${typeof data.checkedAt === 'string' ? data.checkedAt : '제공되지 않았습니다.'}`);
        if (rawDecision === 'unknown' || !Object.hasOwn(decisions, rawDecision)) {
          addText('확인 불가 상태를 허용으로 간주하지 마세요.');
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
        access: { allowed: '허용', denied: '거부', unknown: '확인 불가' },
        session: { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' },
        device: { compliant: '기준 충족', noncompliant: '기준 미충족', unknown: '확인 불가' },
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

      const list = document.createElement('div');
      const ordered = data
        .map((event, index) => ({ event, index }))
        .sort((left, right) => Date.parse(right.event.at) - Date.parse(left.event.at) || left.index - right.index);
      const rawState = (kind, value) => `${stateLabels[kind]?.[value] || '확인 불가'}(${value ?? 'unknown'})`;
      const renderRows = () => {
        list.replaceChildren();
        if (data.length === 0) {
          addText(list, '표시할 기록이 없습니다.');
          return;
        }
        const visible = ordered.filter(({ event }) =>
          (kindFilter.value === 'all' || event.kind === kindFilter.value)
          && (appFilter.value === 'all' || event.appId === appFilter.value)
          && (accessFilter.value === 'all' || event.state?.access === accessFilter.value));
        if (visible.length === 0) {
          addText(list, '선택한 조건에 맞는 기록이 없습니다.');
          return;
        }

        visible.forEach(({ event }, index) => {
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

          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = '상세 보기';
          button.setAttribute('aria-label', `${event.id} 상세`);
          button.setAttribute('aria-expanded', 'false');
          button.setAttribute('aria-controls', detail.id);
          button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            button.textContent = expanded ? '상세 보기' : '상세 닫기';
            detail.hidden = expanded;
          });
          row.append(button, detail);
          list.append(row);
        });
      };

      kindFilter.addEventListener('change', renderRows);
      appFilter.addEventListener('change', renderRows);
      accessFilter.addEventListener('change', renderRows);
      root.append(list);
      renderRows();
      return root;
    },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
