import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const declaration = source.split('\n').find(line => line.startsWith('function modal('));
assert.ok(declaration, 'shared modal renderer must exist');

function renderDialog(action, label) {
  const dialog = {innerHTML: '', showModalCalled: 0, showModal() { this.showModalCalled++; }};
  const button = (text, event, cls) => '<button data-action="' + event + '" class="' + cls + '">' + text + '</button>';
  const modal = runInNewContext('(' + declaration + ')', {
    $: () => dialog,
    button,
    esc: text => text,
  });
  modal('Проверка', '<p>Описание</p>', action, label);
  return dialog;
}

test('informational dialogs have only one dismissal, not Cancel + Close + X', () => {
  for (const label of ['Понятно', 'Закрыть']) {
    const dialog = renderDialog('close', label);
    assert.equal(dialog.showModalCalled, 1);
    assert.equal((dialog.innerHTML.match(/<button/g) || []).length, 1);
    assert.equal((dialog.innerHTML.match(/data-action="close"/g) || []).length, 1);
    assert.ok(dialog.innerHTML.includes(label));
    assert.ok(!dialog.innerHTML.includes('>Отмена<'));
    assert.ok(!dialog.innerHTML.includes('>×<'));
  }
});

test('confirmation dialogs have only two distinct actions: Cancel and Confirm', () => {
  for (const action of ['confirm-reset', 'confirm-long', 'brew', 'replace:fire-bolt:0:0']) {
    const dialog = renderDialog(action, 'Подтвердить');
    assert.equal(dialog.showModalCalled, 1);
    assert.equal((dialog.innerHTML.match(/<button/g) || []).length, 2);
    assert.equal((dialog.innerHTML.match(/data-action="close"/g) || []).length, 1);
    assert.equal((dialog.innerHTML.match(/data-action="${action}"/g) || []).length, 0); // action is matched exactly below
    assert.ok(dialog.innerHTML.includes('data-action="' + action + '"'));
    assert.ok(!dialog.innerHTML.includes('>×<'));
  }
});
