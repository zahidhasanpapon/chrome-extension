import { createRoot } from 'react-dom/client';
import OptionsApp from './OptionsApp';
import '../newtab/index.css';

const container = document.getElementById('root');
if (!container) {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
}

const root = createRoot(container || document.getElementById('root')!);
root.render(<OptionsApp />);
