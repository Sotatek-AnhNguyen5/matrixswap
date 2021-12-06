import styled from "styled-components";

export const ProtocolBadger = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: #182f32;
  border-radius: 71px;
  opacity: 0.88;
  font-size: 18px;
  margin-left: 20px;

  img {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
`;

export const FlexRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(props) => props.justify ?? "space-between"};
  margin-top: ${(props) => props.marginTop ?? "0"};
  height: ${props => props.height ?? "auto"};
`;

export const GridContainer = styled.div`
  width: ${props => props.width ?? "100%"};
  display: grid;
  grid-template-columns: ${props => props.templateColumns};
  margin-top: ${props => props.marginTop ?? "auto"};
  grid-gap: ${props => props.gridGap ?? "auto"};
`

export const GrayLabelText = styled.div`
  font-size: 20px;
  color: ${(props) => props.theme.colorGray};
  font-weight: 400;
  min-width: ${props => props.minWidth ?? "auto"};
`;

export const WhiteLabelText = styled.div`
  font-size: 20px;
  color: #fff;
  font-weight: 400;
`

export const StyledButton = styled.button`
  cursor: pointer;
  &:hover {
    filter: brightness(100);
  }
  &:active {
    filter: brightness(100);
  }
`
