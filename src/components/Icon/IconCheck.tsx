import { FC } from 'react';

type IconCheckProps = {
    className?: string;
};

const IconCheck: FC<IconCheckProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

export default IconCheck;
