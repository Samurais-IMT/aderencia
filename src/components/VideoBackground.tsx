const VideoBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-90"
        style={{ minWidth: '100%', minHeight: '100%' }}
      >
        <source src="/bg-site-uno.mp4#t=8,50" type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoBackground;
