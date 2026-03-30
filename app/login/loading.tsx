export default function Loading() {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: "100dvh",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          animation: "spin 0.8s linear infinite",
          border: "2px solid #2a2a2a",
          borderRadius: "50%",
          borderTopColor: "#ededed",
          height: "28px",
          width: "28px"
        }}
      />
    </div>
  )
}
