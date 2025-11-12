import { FC } from 'react';

type IconEyeOffProps = {
    className?: string;
};

const IconEyeOff: FC<IconEyeOffProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5.05 0-9.14-3.38-10.56-8 1.046-3.52 3.671-6.45 6.93-7.63" />
        <path d="M1 1l22 22" />
        <path d="M9.53 9.53A3 3 0 0 0 14.47 14.47" />
        <path d="M12 4c5.05 0 9.14 3.38 10.56 8-.457 1.544-1.226 2.945-2.24 4.13" />
    </svg>
);

export default IconEyeOff;
