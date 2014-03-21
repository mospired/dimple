         // Copyright: 2013 PMSI-AlignAlytics
         // License: "https://github.com/PMSI-AlignAlytics/dimple/blob/master/MIT-LICENSE.txt"
         // Source: /src/objects/legend/methods/_draw.js
         // Render the legend
        this._draw = function(duration) {

            // Create an array of distinct color elements from the series
            var legendArray = this._getEntries(),
                maxWidth = 0,
                maxHeight = 0,
                runningX = 0,
                runningY = 0,
                keyWidth = 15,
                keyHeight = 9,
                self = this,
                theseShapes;

            // If there is already a legend, fade to transparent and remove
            if (this.shapes !== null && this.shapes !== undefined) {
                this.shapes
                    .transition()
                    .duration(duration * 0.2)
                    .attr("opacity", 0)
                    .remove();
            }

            // Create an empty hidden group for every legend entry
            // the selector here must not pick up any legend entries being removed by the
            // transition above
            theseShapes = this.chart._group
                .selectAll(".dontSelectAny")
                .data(legendArray)
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("opacity", 0);

            // Add text into the group
            theseShapes.append("text")
                .attr("id", function(d) {
                    return "legend_" + d.key;
                })
                .attr("class", "legendText")
                .text(function(d) {
                    return d.key;
                })
                .call(function() {
                    if (!self.chart.noFormats) {
                        this.style("font-family", "sans-serif")
                            .style("font-size", (self.chart._heightPixels() / 35 > 10 ? self.chart._heightPixels() / 35 : 10) + "px")
                            .style("shape-rendering", "crispEdges");
                    }
                })
                .each(function() {
                    var b = this.getBBox();
                    if (b.width > maxWidth) {
                        maxWidth = b.width;
                    }
                    if (b.height > maxHeight) {
                        maxHeight = b.height;
                    }
                });

            // Replace the rectangle with a circle
            // theseShapes.append("rect")
            //     .attr("class", "legendKey")
            //     .attr("height", keyHeight)
            //     .attr("width",  keyWidth);
            //


            theseShapes.append("circle")
                .attr("class", "legendKey");

            // Expand the bounds of the largest shape slightly.  This will be the size allocated to
            // all elements
            maxHeight = (maxHeight < keyHeight ? keyHeight : maxHeight) + 2;
            maxWidth += keyWidth + 20;

            // Iterate the shapes and position them based on the alignment and size of the legend
            theseShapes
                .each(function(d) {
                    if (runningX + maxWidth > self._widthPixels()) {
                        runningX = 0;
                        runningY += maxHeight;
                    }
                    if (runningY > self._heightPixels()) {
                        d3.select(this).remove();
                    } else {
                        d3.select(this).select("text")
                            .attr("x", (self.horizontalAlign === "left" ? self._xPixels() + keyWidth + runningX - 3 : self._xPixels() + (self._widthPixels() - runningX - maxWidth) + keyWidth + 5))
                            .attr("y", function() {
                                // This was previously done with dominant-baseline but this is used
                                // instead due to browser inconsistancy.
                                return self._yPixels() + runningY + this.getBBox().height / 1.65;
                            })
                            .attr("width", self._widthPixels())
                            .attr("height", self._heightPixels());


                        d3.select(this).select("rect")
                            .attr("class", "legend legendKey")
                            .attr("x", (self.horizontalAlign === "left" ? self._xPixels() + runningX : self._xPixels() + (self._widthPixels() - runningX - maxWidth)))
                            .attr("y", self._yPixels() + runningY)
                            .attr("height", keyHeight)
                            .attr("width", keyWidth)
                            .style("fill", function() {
                                return dimple._helpers.fill(d, self.chart, d.series);
                            })
                            .style("stroke", function() {
                                return dimple._helpers.stroke(d, self.chart, d.series);
                            })
                            .style("opacity", function() {
                                return dimple._helpers.opacity(d, self.chart, d.series);
                            })
                            .style("shape-rendering", "crispEdges");

                        // Use the provided values for teh rectangle
                        d3.select(this).select("circle")
                            .attr("cx", (self.horizontalAlign === "left" ? self._xPixels() + runningX : self._xPixels() + (self._widthPixels() - runningX - maxWidth)))
                            .attr("cy", self._yPixels() + runningY + 4)
                            .attr("r", 6)
                            .style("fill", function() {
                                return dimple._helpers.fill(d, self.chart, d.series);
                            })
                            .style("stroke", function() {
                                return dimple._helpers.stroke(d, self.chart, d.series);
                            });

                        runningX += maxWidth;
                    }
                });

            // Fade in the shapes if this is transitioning
            theseShapes
                .transition()
                .delay(duration * 0.2)
                .duration(duration * 0.8)
                .attr("opacity", 1);

            // Assign them to the public property for modification by the user.
            this.shapes = theseShapes;
        };