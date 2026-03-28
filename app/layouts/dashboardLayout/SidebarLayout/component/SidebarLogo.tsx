"use client";

import { observer } from "mobx-react-lite";
import styled, { keyframes } from "styled-components";
import { Avatar } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import stores from "../../../../store/stores";
import { dashboard } from "../../../../config/utils/routes";
import { headerHeight } from "../../../../component/config/utils/variable";

/* ── animations ── */
const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const fadeSlide = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
`;

/* ── component ── */
const SidebarLogo: React.FC = observer(() => {
  const router = useRouter();
  const {
    layout: { isCallapse },
    auth: { user },
  } = stores;

  const companyName = user?.companyDetails?.company_name ?? "Dashboard";
  const logoUrl = user?.companyDetails?.logo?.url;

  /* Two-letter monogram when no logo */
  const initials = companyName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join("");

  return (
    <LogoWrapper
      $height={headerHeight}
      onClick={() => router.push(dashboard.home)}
      role="button"
      aria-label="Go to home"
    >
      {/* Avatar / logo mark */}
      <AvatarRing>
        {logoUrl ? (
          <Avatar
            src={logoUrl}
            size="sm"
            borderRadius="10px"
            bg="transparent"
            style={{ objectFit: "contain" }}
          />
        ) : (
          <Monogram>{initials}</Monogram>
        )}
      </AvatarRing>

      {/* Brand text — hidden when collapsed */}
      {!isCallapse && (
        <BrandText>
          <CompanyName>{companyName}</CompanyName>
          <TagLine>Dashboard</TagLine>
        </BrandText>
      )}

      {/* Decorative accent line at the bottom */}
      <AccentLine />
    </LogoWrapper>
  );
});

export default SidebarLogo;

/* ─────────────── styled ─────────────── */

const LogoWrapper = styled.div<{ $height: string }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  height: ${({ $height }) => $height};
  padding: 0 18px;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;

  /* Subtle top-gradient band */
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.05) 0%,
    transparent 100%
  );

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  transition: background 0.2s ease;
`;

const AvatarRing = styled.div`
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35),
              0 4px 14px rgba(99, 102, 241, 0.4);
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  ${LogoWrapper}:hover & {
    transform: scale(1.06);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5),
                0 6px 20px rgba(99, 102, 241, 0.5);
  }
`;

const Monogram = styled.span`
  font-family: 'Sora', 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
  user-select: none;
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeSlide} 0.25s ease both;
`;

const CompanyName = styled.span`
  font-family: 'Sora', 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;

  /* Shimmer gradient text */
  background: linear-gradient(
    90deg,
    #f1f5f9 0%,
    #ffffff 40%,
    #94a3b8 60%,
    #f1f5f9 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  ${LogoWrapper}:hover & {
    animation: ${shimmer} 1.8s linear infinite;
  }
`;

const TagLine = styled.span`
  font-family: 'DM Sans', sans-serif;
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #475569;
  white-space: nowrap;
`;

const AccentLine = styled.div`
  position: absolute;
  bottom: 0;
  left: 18px;
  right: 18px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(99, 102, 241, 0.4) 30%,
    rgba(139, 92, 246, 0.4) 70%,
    transparent
  );
`;