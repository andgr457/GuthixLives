export const withPreventDefault =
  <T extends React.SyntheticEvent>(callback?: (event: T) => void) =>
  (event: T) => {
    event.preventDefault();
    callback?.(event);
  };