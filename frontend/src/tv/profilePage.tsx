import styled from "styled-components";

interface ProfilePageProps {
    username: String,
    logout: () => void,
}

const ProfilePage = ({username, logout}: ProfilePageProps) => {
    return (
        <>
        <Welcome>Hi, {username}!</Welcome>
          <Actions>
            <New onClick={logout}>Logout</New>
          </Actions>
        </>
    );
};

export default ProfilePage;

const New = styled.div`
  background: #2d3870;
  margin: 0px;
  border-radius: 5px;
  padding: 8px;
  width: 120px;
  height: 30px;
  font-weight: bold;
cursor: pointer;
  color: white;
  border: 2px solid #2d3870;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  &:hover {
    border: 2px solid #2d387050;
    background: #2d387050;
  }
`;


const Actions = styled.div`
  display: flex;
  padding: 31px;
  padding-top: 5px;
`;

const Welcome = styled.div`
  font-size: 2.5rem;
  #font-weight: bold;
  color: #05212f;
  font-family: sans-serif;
  padding: 31px;
  font-family: "Coll";
`;