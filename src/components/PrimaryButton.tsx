import styled from 'styled-components';

interface Props {
    text: string
    click: () => void
}

const PrimaryButton = ({ text, click }: Props) => {
    return (
        <Button onClick={click}>{text}</Button>
    );
};

export default PrimaryButton;

const Button = styled.div`
    font-family : 'Coll';
    text-align: center;
    display: block;
    width: 80%;
    padding: .375rem .75rem;
    font-size: 1.2rem;
    line-height: 1.5;
    color: white;
    background-clip: padding-box;
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
    max-width: 500px;
    margin: auto;
      
    background: #9C8AFA;
       
    cursor: pointer;
    border-radius: 15px;
`;