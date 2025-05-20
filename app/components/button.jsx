export default function Button({text, color}) {
  return (
    <>
      <button
        className={`btn btn-${color}`}
      >
        {text}
      </button>
    </>
  );
}