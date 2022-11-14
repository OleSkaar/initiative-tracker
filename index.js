window.addEventListener('DOMContentLoaded', (_) => {
  renderCreatures();
  document.querySelector('#name').focus();
});

window.addEventListener('popstate', (_) => {
  renderCreatures();
});

document.querySelector('.main-form').addEventListener('submit', (event) => {
    event.preventDefault();
  
    const [name, roll, maxHp] = [...new FormData(event.target).values()];
    const url = new URL(window.location);
  
    url.searchParams.append(name, `${roll}-${maxHp}-0`);
    window.history.pushState({}, '', url);
    dispatchEvent(new PopStateEvent('popstate'));
  
    event.target.reset();
    document.querySelector('#name').focus();
  });

document.querySelector('.clear-button').addEventListener('click', (_) => {
  window.location.search = '';
});

const renderCreatures = () => {
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
      const row = document.createElement('div');
      const { name, roll, maxHp, dmg, status } = creature;

      row.innerHTML = `
      <span>${name}: ${roll}</span>
      <form data-name="${name}" class="damage-input">
        <input type="number" name="damage" placeholder="0"/>
      </form>
      <span>HP: ${maxHp - dmg} / ${maxHp}</span>
      <form data-name="${name}" class="status-input">
        <input type="text" name="status" value="${status ?? ''}" placeholder="Status" />
      </form>`;

      return row;
    });

  document.querySelector('.creatures').replaceChildren(...creatures);

  document.querySelectorAll('.damage-input').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const [value] = [...new FormData(event.target).values()];
      const damage = Number(value);
    
      const url = new URL(window.location);
      const name = form.dataset.name;
      const [roll, maxHp, existingDamage] = url.searchParams
        .get(name)
        .split('-');

      const newDataInUrl = `${roll}-${maxHp}-${
        existingDamage ? Number(existingDamage) + Number(damage) : damage
      }`;

      url.searchParams.set(name, `${newDataInUrl}`);
      window.history.pushState({}, '', url);
      dispatchEvent(new PopStateEvent('popstate'));

      event.target.reset();
    });
  });

  document.querySelectorAll('.status-input').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const [status] = [...new FormData(event.target).values()];
      const url = new URL(window.location);
      const name = form.dataset.name;
      const [roll, maxHp, damage] = url.searchParams
        .get(name)
        .split('-');

      const newDataInUrl = `${roll}-${maxHp}-${damage}-${status}`;

      url.searchParams.set(name, `${newDataInUrl}`);
      window.history.pushState({}, '', url);
      dispatchEvent(new PopStateEvent('popstate'));

      event.target.reset();
    });
  });
};
