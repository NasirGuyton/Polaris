function ProgressBar({ current, total }) {
  const percent = ((current + 1) / (total + 1)) * 100;
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

export default ProgressBar;