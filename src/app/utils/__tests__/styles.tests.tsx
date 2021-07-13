import styles from "./_styles.scss";
import { accessClassName } from "../styles";
import { assert } from "chai";

describe("styles", () => {
    describe("accessClassName", () => {
        test("none", () => {
            const result = accessClassName(styles);
            assert.strictEqual(result, "");
        });

        test("1", () => {
            const result = accessClassName(styles, "className1");
            assert.strictEqual(result, "className1");
        });

        test("multiple", () => {
            const result = accessClassName(styles, "className1", "className2", "className3");
            assert.strictEqual(result, "className1 className2 className3");
        });

        test("error - does not exist", () => {
            assert.throw(() => accessClassName(styles, "does not exist"), /does not exist/i);
        });
    });
});