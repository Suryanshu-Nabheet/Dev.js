import {useState} from 'devjs';
import {bar} from './bar';

export const useFoot = () => {
  const [, setState] = useState(null);
  try {
    const {data} = bar();
    setState({
      data,
      error: null,
    });
  } catch (err) {
    setState(_prevState => ({
      loading: false,
      error: err,
    }));
  }
};
