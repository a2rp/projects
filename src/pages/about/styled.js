import styled from "styled-components";

export const Styled = {
    Wrapper: styled.div`
        display: flex;
        justify-content: center;
        align-items: center;
    `,
    Main: styled.div`
        width: 100%;
        max-width: 600px;

        h3 {
            color: #fff;
        }

        p {
            margin-bottom: 30px;

            b {
                color: orangered;
                margin-top: 15px;
                display: block;
            }
        }

        ul {
            margin-left: 15px;
            margin-bottom: 30px;
        }
    `,
};
