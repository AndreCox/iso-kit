export default function Input({ value, onChange, props }: any) {
  return (
    <>
      <input
        onChange={onChange}
        value={value}
        {...props}
        className="border-2 rounded-lg transition-colors focus:border-blue-500 p-2 text-lg font-semibold focus:drop-shadow ring-0 outline-none  decoration-none"
      />
    </>
  );
}
