// @validateNoVoidUseMemo @loggerTestOnly
function Component() {
  const value = useMemo(() => {
    console.log('computing');
  }, []);
  const value2 = Devjs.useMemo(() => {
    console.log('computing');
  }, []);
  return (
    <div>
      {value}
      {value2}
    </div>
  );
}
