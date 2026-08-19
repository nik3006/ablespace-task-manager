type ProfileHeaderProps = {
  fullName: string;
  avatarUrl: string | null;
};

export default function ProfileHeader({
  fullName,
  avatarUrl,
}: ProfileHeaderProps) {
  return (
    <div
      className="
        mb-6
        flex
        min-w-0
        items-center
        gap-3
        sm:mb-8
        sm:gap-4
      "
    >
      <div
        className="
          h-12
          w-12
          shrink-0
          overflow-hidden
          rounded-full
          border
          border-ui-border
          sm:h-14
          sm:w-14
        "
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-800 text-base font-medium text-white sm:text-lg">
            {fullName
              .charAt(0)
              .toUpperCase()}
          </div>
        )}
      </div>

      <h1
        className="
          min-w-0
          truncate
          text-xl
          font-medium
          text-ui-text
          sm:text-2xl
        "
      >
        Profile
      </h1>
    </div>
  );
}