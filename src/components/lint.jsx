/**
 * This component renders "lint" nodes in a markdown parse tree. Lint nodes
 * are inserted into the tree by the Gorgon linter (see src/gorgon/gorgon.js).
 *
 * This component serves multiple purposes
 *
 * 1) It renders a small circle in the right margin to indicate that there
 * is lint on (or near) that line.
 *
 * 2) The area around the circle is hoverable: when the mouse moves over it
 * the linty content is highlighted and a tooltip is displayed that explains
 * what the problem is.
 *
 * 3) The hoverable area is also an HTML <a> tag. Clicking on it opens
 * a new tab and links to additional details about the specific lint rule.
 *
 * The CSS required to position the circles in the right margin is tricky
 * and it does not always work perfectly. When lint occurs on a block element
 * that has a right margin (like anything blockquoted) the circle will appear
 * to the left of where it belongs.  And if there is more
 **/
const React = require("react");
const {StyleSheet, css} = require("aphrodite");
const constants = require("../styles/constants.js");

const Lint = React.createClass({
    propTypes: {
        // The children are the linty content we're highlighting
        children: React.PropTypes.node,
        // Inline lint is highlighted differently than block lint.
        inline: React.PropTypes.bool,
        // This is the text that appears in the tooltip
        message: React.PropTypes.string.isRequired,
        // This is used as the fragment id (hash) in the URL of the link
        ruleName: React.PropTypes.string.isRequired,
    },

    // Render the <a> element that holds the indicator icon and the tooltip
    // We pass different styles for the inline and block cases
    renderLink: function(style) {
        return (
            <a
                href={
                    "https://khanacademy.org/r/linter-rules#" +
                        this.props.ruleName
                }
                target="lint-help-window"
                className={css(style)}
            >
                <span className={css(styles.indicator)} />
                <div className={css(styles.tooltip)}>
                    {this.props.message.split("\n\n").map(m => (
                        <p className={css(styles.tooltipParagraph)}>
                            <span className={css(styles.warning)}>
                                Warning:{" "}
                            </span>
                            {m}
                        </p>
                    ))}
                    <div className={css(styles.tail)} />
                </div>
            </a>
        );
    },

    // The main render method surrounds linty content with a block or
    // inline container and the link element that displays the indicator
    // and holds the tooltip.
    render: function() {
        if (this.props.inline) {
            return (
                <span className={css(styles.lintContainer)}>
                    {this.renderLink(styles.inlineHoverTarget)}
                    <span>
                        {this.props.children}
                    </span>
                </span>
            );
        } else {
            return (
                <div className={css(styles.lintContainer)}>
                    {this.renderLink(styles.hoverTarget)}
                    <div>
                        {this.props.children}
                    </div>
                </div>
            );
        }
    },
});

const styles = StyleSheet.create({
    // This is the class of the outermost element.
    // We use relative positioning so that the lint indicator can be
    // positioned absolutely relative to the position of the linty container.
    lintContainer: {
        position: "relative",
    },

    // This is the main class for block lint. It is applied to the link element
    // that is also the hover target.
    hoverTarget: {
        // Absolute positioning relative to the lintContainer element
        position: "absolute",
        // Top of the hover target is aligned with the top of the linty block
        top: 0,

        // We want the hover target in the right margin. It is 24px wide, but
        // we have to offset it another 16px because of margins in the
        // Perseus content. I'm not sure where the 16px margin is set
        // so if that changes, this number will also have to be changed.
        // This is the part of the CSS that doesn't work right when
        // applied to things like blockquotes that have different right
        // margins.
        right: -40,

        // The hover target is a 24x24 block element.
        display: "block",
        width: 24,
        height: 24,

        // The indicator is in a span inside the hover target.
        // This style changes its color on hover
        ":hover > span": {
            backgroundColor: constants.warningColorHover,
        },

        // The tooltip is in a div element inside the hover target.
        // This style displays it on hover
        ":hover div": {
            display: "block",
        },

        // The linty content is in a <div> sibling that follows the
        // hover target. This style highlights it on hover. We do an outline
        // rather than a border so we don't affect the layout. We could also
        // set the background color, but we don't because we can't reliably
        // set the text color of this block element. We could use
        // filter: invert(100%) if we want more visual change on hover here.
        ":hover ~ div": {
            outline: "1px solid " + constants.warningColor,
        },
    },

    // This is how we position the hover target for inline lint.
    inlineHoverTarget: {
        // For inline lint we position the hover target with a float:right
        // We can't use absolute positioning as we do in the block case
        // because the horizontal position is not predictable in the
        // inline case.
        float: "right",

        // We still have to make the hover target relative so that the
        // tooltip can be positioned relative to it.
        position: "relative",

        // See the comment above about the extra 16px of offset needed here.
        marginRight: -40,

        // The hover target is a 24x24 block. Same as the block case
        display: "block",
        width: 24,
        height: 24,

        // The indicator is in a span inside the hover target.
        // This style changes its color on hover.
        // This is the same as the block case.
        ":hover > span": {
            backgroundColor: constants.warningColorHover,
        },

        // The tooltip is in a div element inside the hover target.
        // This style displays it on hover. This is the same as the block case.
        ":hover div": {
            display: "block",
        },

        // The linty content is in a <span> sibling that follows the
        // hover target. This style highlights it on hover. In this case
        // we can just set the foreground and background color to really
        // draw attention to the linty content.
        ":hover ~ span": {
            backgroundColor: constants.warningColor,
            color: constants.white,
        },
    },

    // This is the class for the lint indicator in the margin.
    // It is an orangish circle 8px in diameter. If, in the future
    // we add lint errors to the existing warnings, we'll use a different
    // color to distinguish errors from warnings.
    indicator: {
        display: "block", // Marked up with span, but displayed as a block
        backgroundColor: constants.warningColor,
        borderRadius: 4,
        height: 8,
        width: 8,
        margin: 8,
    },

    // These are the styles for the tooltip
    tooltip: {
        // Absolute positioning relative to the lint indicator circle.
        position: "absolute",
        right: -12,
        bottom: 32,

        // The tooltip is hidden by default; only displayed on hover
        display: "none",

        // When it is displayed, it goes on top!
        zIndex: "1000",

        // These styles control what the tooltip looks like
        color: constants.white,
        backgroundColor: constants.gray17,
        opacity: "0.9",
        fontFamily: constants.baseFontFamily,
        fontSize: "12px",
        lineHeight: "15px",
        width: "320px",
        padding: "6px",
        borderRadius: "4px",
    },

    // We give the tooltip a little triangular "tail" that points down at
    // the lint indicator circle. This is inside the tooltip and positioned
    // relative to it. It also shares the opacity of the tooltip. We're using
    // the standard CSS trick for drawing triangles with a thick border.
    tail: {
        position: "absolute",
        right: 12, // This should match the right property of the tooltip
        bottom: -12,
        width: 0,
        height: 0,
        // This is the CSS triangle trick
        borderLeft: "12px solid transparent",
        borderRight: "12px solid transparent",
        borderTop: "12px solid " + constants.gray17,
    },

    // We use <p> elements inside the tooltip to separate multiple warnings
    // from each other. But to make this work we need to cut down on their
    // default margins
    tooltipParagraph: {
        margin: 6,
    },

    // The text "Warning" inside the tooltip is highlighted like this
    warning: {
        color: constants.warningColor,
        fontFamily: constants.boldFontFamily,
    },
});

module.exports = Lint;
