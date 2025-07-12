function renderInfo(meta) {
  const container = document.createElement('div');

  Object.entries(meta).forEach(([sectionName, items]) => {
    if (!Array.isArray(items)) return;

    const box = document.createElement('div');
    box.className = 'info-box';

    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'info-row';

      const label = document.createElement('span');
      label.textContent = item.label;

      const value = document.createElement('span');
      value.textContent = item.value;

      row.appendChild(label);
      row.appendChild(value);

      if (sectionName === 'balances') {
        const converted = document.createElement('span');
        converted.textContent = '0,00 BRL';
        row.appendChild(converted);
        row.classList.add('has-conversion');
      }

      if (sectionName === 'timers') {
        const status = document.createElement('span');
        status.textContent = item.status || 'desconhecido';
        status.className = 'status-pill ' + (item.status === 'ativo' ? 'on' : 'off');
        row.appendChild(status);
        row.classList.add('has-status');
      }

      box.appendChild(row);
    });

    container.appendChild(box);
  });

  return container;
}

window.addEventListener('DOMContentLoaded', async () => {
  const folders = await window.electronAPI.readFolders();
  const faucetList = document.getElementById('faucetList');
  const infoDisplay = document.getElementById('infoDisplay');
  const mainTitle = document.getElementById('mainTitle');
  const editButton = document.getElementById('editButton');

  let selectedFolder = null;

  folders.forEach(folder => {
    const div = document.createElement('div');

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.className = 'faucet-toggle';
    toggle.addEventListener('change', (e) => {
      addLog(new Date().toLocaleTimeString(), folder, 'interruptor', e.target.checked ? 'Ativado' : 'Desativado');
    });

    const label = document.createElement('span');
    label.textContent = folder;

    div.append(toggle, label);
    div.onclick = async () => {
      document.querySelectorAll('#faucetList div').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      selectedFolder = folder;

      const info = await window.electronAPI.readInfo(folder);
      const meta = info.meta || {};
      const url = info.internal?.url || info.meta?.url || null;

      mainTitle.innerHTML = '';
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';
        link.style.display = 'flex';
        link.style.alignItems = 'center';
        link.style.gap = '6px';

        const icon = document.createElement('span');
        icon.textContent = '🔗';
        icon.style.fontSize = '16px';

        const text = document.createElement('span');
        text.textContent = folder;

        link.appendChild(icon);
        link.appendChild(text);

        mainTitle.appendChild(link);
      } else {
        mainTitle.textContent = folder;
      }

      infoDisplay.innerHTML = '';
      infoDisplay.appendChild(renderInfo(meta));

      addLog(new Date().toLocaleTimeString(), folder, 'info', 'Visualizado');
    };

    faucetList.appendChild(div);
  });

  editButton.onclick = () => {
    if (selectedFolder) {
      alert(`Função de edição para: ${selectedFolder}`);
    } else {
      alert('Selecione uma faucet primeiro.');
    }
  };
});

function addLog(hora, nome, tipo, acao) {
  const log = document.getElementById('logContent');
  const row = document.createElement('div');
  row.className = 'log-row';
  [hora, nome, tipo, acao].forEach(t => {
    const span = document.createElement('span');
    span.textContent = t;
    row.appendChild(span);
  });
  log.prepend(row);
}