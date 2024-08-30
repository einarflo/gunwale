import styled from 'styled-components';

interface Props {
    text: string
    click: () => void
}

const WhiteButton = ({ text, click }: Props) => {
    return (
        <Button onClick={click}>{text}</Button>
    );
};

export default WhiteButton;

const Button = styled.div`
    font-family : 'Coll';
    text-align: center;
    display: block;
    width: 80%;
    padding: .375rem .75rem;
    font-size: 1.2rem;
    line-height: 1.5;
    color: #9C8AFA;
    background-clip: padding-box;
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    max-width: 350px;
      
    background: white;
       
    cursor: pointer;
    border-radius: 15px;
`;