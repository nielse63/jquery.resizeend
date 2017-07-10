
export default function debounce(func, wait = 100, immediate) {
  let timeout;
  let args;
  let context;
  let timestamp;
  let result;

  function later() {
    const last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = null;
        args = null;
      }
    }
  }

  const debounced = function debounced(...args1) {
    context = this;
    args = args1;
    timestamp = Date.now();
    const callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = null;
      args = null;
    }
    return result;
  };

  debounced.clear = function clear() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  debounced.flush = function flush() {
    if (timeout) {
      result = func.apply(context, args);
      context = null;
      args = null;

      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}
