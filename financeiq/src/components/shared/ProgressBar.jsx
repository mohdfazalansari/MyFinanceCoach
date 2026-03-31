import { C } from "../../utils/theme";
export default function ProgressBar({ value, color }) {
  return (
    <div className="progress-bar-track" style={{ marginBottom: 10 }}>
      <div className="progress-bar-fill" style={{ width: `${value}%`, background: color }}/>
    </div>
  );
}