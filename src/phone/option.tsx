import styled from "styled-components";

interface OptionProps {
    description: String,
    select: () => void,
    colour: string
}

const OptionButton = ({ description, select, colour }: OptionProps) => {
    return(
    <Option onClick={select} color={colour}>{description}</Option>)
}

const Option = styled.div`
  height: 70px;
  width: 100vw - 40px;
  background-color: ${props => (props.color)};
  border-radius: 20px;
  margin: 20px;
  padding: 20px;
`;

export default OptionButton