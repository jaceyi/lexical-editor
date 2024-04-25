// filter props have value
export const FilterWithProps = ({ children }) => {
  const { props } = children;
  for (const key in props) {
    if (props.hasOwnProperty(key) && props[key] === undefined) {
      return null;
    }
  }

  return children;
};
