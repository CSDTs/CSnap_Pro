function labelText(string) {
	return new TextMorph(
		localize(string),
		10,
		null, // style
		false, // bold
		null, // italic
		null, // alignment
		null, // width
		null, // font name
		MorphicPreferences.isFlat ? null : new Point(1, 1),
		WHITE // shadowColor
	);
}

const createLabel = (alignment, label, input, width = 200) => {
	input.setWidth(width);
	alignment.add(labelText(label));
	alignment.add(input);
};

export { createLabel };
