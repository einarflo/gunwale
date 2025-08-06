import styled, { keyframes } from 'styled-components';

interface Props {
    text: string
    click: () => void
    loading?: boolean
}

const PrimaryButton = ({ text, click, loading = false }: Props) => {
    return (
        <Button loading={loading} onClick={!loading ? click : () => {}}>{!loading ? text : <Spinner/>}</Button>
    );
};

export default PrimaryButton;


const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
width: 1.2rem;
height: 1.2rem;
margin-left: auto;
margin-right: auto;
margin-top: 2px;
margin-bottom: 2px;
left: 50%;
border: 3px solid rgba(255,255,255,.3);
border-radius: 50%;
border-top-color: #fff;
animation: spin 1s ease-in-out infinite;
-webkit-animation: ${rotate} 1s ease-in-out infinite;
`;

const Button = styled.div.attrs((props: {loading: boolean}) => props)`
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
       
    cursor: ${props => props.loading  ? 'default' : 'pointer'};
    border-radius: 15px;
`;
