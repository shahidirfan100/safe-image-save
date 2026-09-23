export function createContextMenuSetup({ removeAll, create, items }) {
  let setupInFlight = null;

  return function setupContextMenus() {
    if (setupInFlight) return setupInFlight;

    const setup = (async () => {
      await removeAll();
      for (const item of items) await create(item);
    })();

    setupInFlight = setup;
    const clearInFlight = () => {
      if (setupInFlight === setup) setupInFlight = null;
    };
    setup.then(clearInFlight, clearInFlight);
    return setup;
  };
}
