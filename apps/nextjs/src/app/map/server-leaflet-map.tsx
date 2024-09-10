
import * as L from "../../utils/server/server-leaflet";
import path from "path";

// import L from 'leaflet'; // This will now use your sandboxed version
// import {MapElement} from '../../utils/server/leafet-component'

export const CustomMap = () => {
  console.log("path", path);
  console.log("l", L.map);
  // const mapRef = useRef(null);

  // useEffect(() => {
  // if (mapRef.current) {
  // const map = L.map(mapRef.current).setView([51.505, -0.09], 13);
  // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   attribution: '© OpenStreetMap contributors'
  // }).addTo(map);
  // }
  // }, []);

  return (
    <div>
      test
      <div className="h-80 w-80"></div>
    </div>
  );
};
