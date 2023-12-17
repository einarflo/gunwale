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
  height: 155px;
  width: 100%;
  background-color: ${props => (props.color)};
  border-radius: 20px;
  margin: 10px;
  padding: 10px;
  color: white;
  font-size: 2em;
  line-height: 1;
  overflow: hidden;
  
  font-family: "Coll";
  text-align: center;
  display: flex;
  justify-content: center;
 align-items: center;
`;//white-space: nowrap;

export default OptionButton