import styled from "styled-components";

interface OptionProps {
    description: String,
    select: () => void,
    colour: string,
    hide: boolean,
}

const OptionButton = ({ description, select, colour, hide }: OptionProps) => {
    return(
    <Option hide={hide} onClick={select} color={colour}>{description}</Option>)
}

const Option = styled.div.attrs((props: {hide: boolean}) => props)`
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
  opacity: ${props => (props.hide ? '30%' : '100%')};
  
  font-family: "Coll";
  text-align: center;
  display: flex;
  justify-content: center;
 align-items: center;
`;//white-space: nowrap;

export default OptionButton