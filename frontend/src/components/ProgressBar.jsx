function ProgressBar({ current, total }) {
  const percent = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

export default ProgressBar;