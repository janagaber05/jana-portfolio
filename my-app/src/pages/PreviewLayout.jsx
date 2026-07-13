import { Outlet } from 'react-router-dom';
import RouteChangeHandler from '../components/RouteChangeHandler';

export default function PreviewLayout() {
  return (
    <RouteChangeHandler>
      <Outlet />
    </RouteChangeHandler>
  );
}
