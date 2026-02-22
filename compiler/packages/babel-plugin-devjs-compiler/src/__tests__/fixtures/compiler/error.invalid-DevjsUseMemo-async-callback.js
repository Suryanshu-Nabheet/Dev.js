function component(a, b) {
  let x = Devjs.useMemo(async () => {
    await a;
  }, []);
  return x;
}
