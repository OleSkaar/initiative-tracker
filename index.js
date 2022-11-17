window.addEventListener('DOMContentLoaded', (_) => {
  render();
  document.querySelector('#name').focus();
});

window.addEventListener('popstate', (_) => {
  render();
});

document.querySelector('.main-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const [name, roll, maxHp] = [...new FormData(event.target).values()];
  const url = new URL(window.location);

  url.searchParams.append(name, `${roll}-${maxHp}-0`);

  document.querySelector('#name').focus();
  updateUrl(event, url);
});

document.querySelector('.clear-button').addEventListener('click', (_) => {
  window.location.search = '';
});

const render = () => {
  const creatures = [...new URL(window.location).searchParams.entries()]
    .map((entry) => {
      const name = entry[0];
      const [roll, maxHp, dmg, status] = entry[1].split('-');

      return {
        name,
        roll: Number(roll),
        maxHp: Number(maxHp),
        dmg: Number(dmg),
        status,
      };
    })
    .sort((a, b) => a.roll < b.roll)
    .map((creature) => {
      const { name, roll, maxHp, dmg, status } = creature;
      const row = document.createElement('div');
      row.classList.add('grid');
      if (dmg >= maxHp) {
        row.classList.add('knocked-out');
      }

      row.innerHTML = `
      <span>${name}</span>
      <span>${roll}</span>
      <div>
        <span>${maxHp - dmg} / ${maxHp}</span>
        <meter value=${maxHp - dmg} low=${maxHp / 2} min=0 max=${maxHp} />
      </div>
      <form data-name="${name}" class="update-input">
        <input type="number" name="damage" placeholder="0"/>
      </form>
      <form data-name="${name}" class="update-input">
        <input type="text" name="status" value="${
          status ?? ''
        }" placeholder="Status" />
      </form>`;

      return row;
    });

  document.querySelector('.creatures').replaceChildren(...creatures);

  document.querySelectorAll('.update-input').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const [key, value] = [...new FormData(event.target).entries()].flat();
      const name = event.target.dataset.name;
      const url = new URL(window.location);
      let [roll, maxHp, damage, status] = url.searchParams.get(name).split('-');

      if (key === 'damage') {
        damage = Number(damage) + Number(value);
      }

      if (key === 'status') {
        status = value;
      }

      const stringData = [roll, maxHp, damage, status]
        .filter((string) => !!string)
        .join('-');

      url.searchParams.set(name, `${stringData}`);
      updateUrl(event, url);
    });
  });
};

const updateUrl = (event, url) => {
  event.target.reset();
  window.history.pushState({}, '', url);
  dispatchEvent(new PopStateEvent('popstate'));
};
