export const filterWithProps = Component => {
  return props => {
    for (const key in props) {
      if (props.hasOwnProperty(key) && props[key] === undefined) {
        return null;
      }
    }
    return <Component {...props} />;
  };
};
